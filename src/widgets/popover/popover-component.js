import { Component } from "../component.js";
import { Dom } from "../../dom/dom-utils.js";

const referencePlacements = ["top", "left"];

const placementConfiguration = {
  top: {
    principalAxis: "top",
    fallbackAxis: "bottom",
    mainDimension: "height",
    crossAxis: {
      start: "left",
      end: "right",
      dimension: "width",
    },
  },
  bottom: {
    principalAxis: "bottom",
    fallbackAxis: "top",
    mainDimension: "height",
    crossAxis: {
      start: "left",
      end: "right",
      dimension: "width",
    },
  },
  left: {
    principalAxis: "left",
    fallbackAxis: "right",
    mainDimension: "width",
    crossAxis: {
      start: "top",
      end: "bottom",
      dimension: "height",
    },
  },
  right: {
    principalAxis: "right",
    fallbackAxis: "left",
    mainDimension: "width",
    crossAxis: {
      start: "top",
      end: "bottom",
      dimension: "height",
    },
  },
};

const VERTICAL_PLACEMENT = Symbol();
const HORIZONTAL_PLACEMENT = Symbol();

export default class PopoverComponent extends Component {
  constructor(widget) {
    super(widget);
    this.#init();
  }

  get #placementAxis() {
    const placement = this.popover.placement;
    return placement === "top" || placement === "bottom"
      ? VERTICAL_PLACEMENT
      : HORIZONTAL_PLACEMENT;
  }

  createElement() {
    return Dom.elm("div", {
      class: "popover-container",
    });
  }

  onMounted() {
    console.log("popover mounted");
  }

  onStartOpen() {
    if (this.isConnected) return;

    this.mount(document.body);
    this.hide(); // Oculto al principio

    const position = this.#getPosition(this.popover.placement);
    if (!position) return;

    const offset =
      this.#placementAxis === VERTICAL_PLACEMENT
        ? { x: -this.popover.offset, y: 0 }
        : { x: 0, y: -this.popover.offset };

    this.css({
      position: "absolute",
      top: `${position.top + offset.x}px`,
      left: `${position.left + offset.y}px`,
      zIndex: "999",
    });

    const delay = this.popover.delay;
    if (delay > 0) {
      setTimeout(() => this.#open(), delay);
    } else {
      this.#open();
    }
  }

  #init() {
    this.popover.on("startOpen", this.onStartOpen.bind(this));
    this.popover.on("startClose", () => this.#close());
  }

  #open() {
    this.show();
    this.popover.emit("opened");
  }

  #close() {
    this.dismount();
    this.popover.emit("closed");
  }

  #getPosition(placement) {
    const boundaries = {
      targetBounds: this.popover.target.component.bounds,
      popoverBounds: this.bounds,
      playerBounds: this.popover.player.component.bounds,
    };

    if (this.popover.preventOverflow) {
      return this.#getPositionWithinBounds(placement, boundaries);
    }

    return this.#getPositionAllowingOverflow(placement, boundaries);
  }

  #resolvePositionByAxis(axisPosition, crossAxisPosition) {
    const isVerticalPlacement = this.#placementAxis === VERTICAL_PLACEMENT;

    return {
      top: isVerticalPlacement ? axisPosition : crossAxisPosition,
      left: isVerticalPlacement ? crossAxisPosition : axisPosition,
    };
  }

  #getPositionAllowingOverflow(placement, { targetBounds, popoverBounds }) {
    const { principalAxis, mainDimension, crossAxis } =
      placementConfiguration[placement];
    const { start, dimension } = crossAxis;
    const isReferencePlacement = referencePlacements.includes(placement);
    const axisPosition = isReferencePlacement
      ? targetBounds[principalAxis] - popoverBounds[mainDimension]
      : targetBounds[principalAxis];
    const crossAxisPosition =
      targetBounds[start] +
      targetBounds[dimension] / 2 -
      popoverBounds[dimension] / 2;

    return this.#resolvePositionByAxis(axisPosition, crossAxisPosition);
  }

  #getPositionWithinBounds(placement, boundaries) {
    const axisPosition = this.#calculatePrincipalAxisPosition(
      placement,
      boundaries
    );
    const crossAxisPosition = this.#calculateCrossAxisPosition(
      placement,
      boundaries
    );

    if (axisPosition === -1 || crossAxisPosition === -1) {
      return null;
    }

    return this.#resolvePositionByAxis(axisPosition, crossAxisPosition);
  }

  #calculateAvailableSpace(
    isStartingEdge,
    edgeKey,
    targetBounds,
    playerBounds
  ) {
    return isStartingEdge
      ? targetBounds[edgeKey] - playerBounds[edgeKey]
      : playerBounds[edgeKey] - targetBounds[edgeKey];
  }

  #adjustCoordinateToBoundary(
    protrudingSpaceAmount,
    availableSpaceAmount,
    popoverBoundaryCoordinate,
    playerBoundaryLimit,
    returnCoordinateIfPossible,
    isAdjustingTowardsStart
  ) {
    const requiredAdjustmentSpace =
      protrudingSpaceAmount - availableSpaceAmount;
    let canPerformMove;

    if (isAdjustingTowardsStart) {
      // Si ajustamos hacia el inicio (ej. de izquierda a derecha), el popover se mueve 'más allá' de su borde inicial.
      // El borde final del popover + el ajuste necesario no debe exceder el límite final del reproductor.
      canPerformMove =
        popoverBoundaryCoordinate + requiredAdjustmentSpace <=
        playerBoundaryLimit;
    } else {
      // Si ajustamos hacia el final (ej. de derecha a izquierda), el popover se mueve 'antes' de su borde final.
      // El borde inicial del popover - el ajuste necesario no debe ser menor que el límite inicial del reproductor.
      canPerformMove =
        popoverBoundaryCoordinate - requiredAdjustmentSpace >=
        playerBoundaryLimit;
    }

    return canPerformMove ? returnCoordinateIfPossible : -1;
  }

  #calculatePrincipalAxisPosition(
    placement,
    { targetBounds, popoverBounds, playerBounds }
  ) {
    const { principalAxis, fallbackAxis, mainDimension } =
      placementConfiguration[placement];
    const isReferencePlacement = referencePlacements.includes(placement);

    const tryPosition = (axis, isReverse) => {
      const availableSpace = this.#calculateAvailableSpace(
        isReverse,
        axis,
        targetBounds,
        playerBounds
      );
      const hasEnoughSpace = availableSpace >= popoverBounds[mainDimension];

      if (hasEnoughSpace) {
        return isReverse
          ? targetBounds[axis] - popoverBounds[mainDimension] // Para 'top' o 'left'
          : targetBounds[axis]; // Para 'bottom' o 'right'
      }
      return null;
    };

    return (
      tryPosition(principalAxis, isReferencePlacement) ??
      tryPosition(fallbackAxis, !isReferencePlacement) ??
      -1
    );
  }

  #calculateCrossAxisPosition(
    placement,
    { targetBounds, popoverBounds, playerBounds }
  ) {
    const { crossAxis } = placementConfiguration[placement];
    const { start, end, dimension } = crossAxis;

    const popoverStartCoordinate =
      targetBounds[start] +
      targetBounds[dimension] / 2 -
      popoverBounds[dimension] / 2;
    const popoverEndCoordinate =
      popoverStartCoordinate + popoverBounds[dimension];

    const availableStartSpace = targetBounds[start] - playerBounds[start];
    const availableEndSpace = playerBounds[end] - targetBounds[end];

    const popoverProtrudingStartSpace =
      targetBounds[start] - popoverStartCoordinate;
    const popoverProtrudingEndSpace = popoverEndCoordinate - targetBounds[end];

    const fitsWithinStartBoundary =
      availableStartSpace >= popoverProtrudingStartSpace;
    const fitsWithinEndBoundary =
      availableEndSpace >= popoverProtrudingEndSpace;

    if (fitsWithinStartBoundary && fitsWithinEndBoundary) {
      return popoverStartCoordinate;
    }

    // --- Si no cabe, intentamos ajustarlo ---
    // Si no cabe en el lado de 'inicio' (ej. izquierda para 'top'/'bottom' placements)
    if (!fitsWithinStartBoundary) {
      return this.#adjustCoordinateToBoundary(
        popoverProtrudingStartSpace,
        availableStartSpace,
        popoverEndCoordinate,
        playerBounds[end],
        popoverStartCoordinate +
          (popoverProtrudingStartSpace - availableStartSpace),
        true
      );
    }

    // Si llegamos aquí, significa que !fitsWithinEndBoundary (no cabe en el lado de 'fin' o derecha)
    return this.#adjustCoordinateToBoundary(
      popoverProtrudingEndSpace,
      availableEndSpace,
      popoverStartCoordinate,
      playerBounds[start],
      popoverStartCoordinate - (popoverProtrudingEndSpace - availableEndSpace),
      false
    );
  }
}
