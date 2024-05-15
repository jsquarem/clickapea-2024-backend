const imperialUnits = [
    "teaspoon", "tsp", "tsp.", "tablespoon", "tbsp", "tbsp.", "cup", "cups", "pint", "pt", "pt.", "quart", "qt", "qt.", "gallon", "gal", "oz", "ounce", "ounces", "lb", "pound", "pounds", "in", "inch", "inches"
  ];
  
  const metricUnits = [
    "milliliter", "ml", "millilitres", "milliliters", "ml.", "liter", "litre", "liters", "litres", "l", "g", "gram", "grams", "gramme", "grammes", "kilogram", "kg", "kilograms", "kilogrammes", "cm", "centimeter", "centimetre", "centimeters", "centimetres", "mm", "millimeter", "millimetre", "millimeters", "millimetres"
  ];
  
  const isImperialUnit = (unit) => {
    return imperialUnits.includes(unit.toLowerCase());
  };
  
  const isMetricUnit = (unit) => {
    return metricUnits.includes(unit.toLowerCase());
  };
  
  const roundToFraction = (quantity) => {
    const fractions = [0, 1 / 8, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1];
    const wholeNumber = Math.floor(quantity);
    const decimalPart = quantity - wholeNumber;
  
    let closestFraction = fractions[0];
    let minDifference = Math.abs(decimalPart - fractions[0]);
  
    for (let i = 1; i < fractions.length; i++) {
      const difference = Math.abs(decimalPart - fractions[i]);
      if (difference < minDifference) {
        closestFraction = fractions[i];
        minDifference = difference;
      }
    }
  
    if (closestFraction === 1) {
      return wholeNumber + 1;
    } else if (wholeNumber === 0 && closestFraction === 0) {
      return 0;
    } else {
      return wholeNumber + closestFraction;
    }
  };
  
  const convertToImperial = (quantity, unit) => {
    if (unit === "picoinch") {
      unit = "pinch";
    }
  
    switch (unit) {
      case "ml":
      case "milliliter":
      case "milliliters":
        return { quantity: roundToFraction((quantity / 240).toFixed(2)), unit: "cup" };
      case "g":
      case "gram":
      case "grams":
        return { quantity: roundToFraction((quantity / 28.35).toFixed(2)), unit: "oz" };
      case "l":
      case "liter":
      case "liters":
        return { quantity: roundToFraction((quantity * 4.227).toFixed(2)), unit: "cup" };
      case "kg":
      case "kilogram":
      case "kilograms":
        return { quantity: roundToFraction((quantity * 2.205).toFixed(2)), unit: "lb" };
      case "teaspoon":
      case "tsp":
      case "tsp.":
        return { quantity: roundToFraction((quantity / 4.929).toFixed(2)), unit: "tsp" };
      case "tablespoon":
      case "tbsp":
      case "tbsp.":
        return { quantity: roundToFraction((quantity / 14.787).toFixed(2)), unit: "tbsp" };
      default:
        return { quantity: roundToFraction(quantity.toFixed(2)), unit };
    }
  };
  
  const convertToMetric = (quantity, unit) => {
    switch (unit) {
      case "cup":
      case "cups":
        return { quantity: (quantity * 240).toFixed(2), unit: "ml" };
      case "oz":
      case "ounce":
      case "ounces":
        return { quantity: (quantity * 28.35).toFixed(2), unit: "g" };
      case "gallon":
      case "gal":
        return { quantity: (quantity * 3.785).toFixed(2), unit: "l" };
      case "lb":
      case "pound":
      case "pounds":
        return { quantity: (quantity * 0.454).toFixed(2), unit: "kg" };
      case "tsp":
      case "teaspoon":
      case "teaspoons":
        return { quantity: (quantity * 4.929).toFixed(2), unit: "ml" };
      case "tbsp":
      case "tablespoon":
      case "tablespoons":
        return { quantity: (quantity * 14.787).toFixed(2), unit: "ml" };
      default:
        return { quantity: quantity.toFixed(2), unit };
    }
  };
  
  module.exports = {
    isImperialUnit,
    isMetricUnit,
    roundToFraction,
    convertToImperial,
    convertToMetric
  };
  