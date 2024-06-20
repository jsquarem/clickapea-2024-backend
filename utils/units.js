const logger = require('./logger');

const metricDictionary = {
  "ml": { multiplier: 1 / 240, unit: "cup", normalized_unit: "ml" },
  "ml.": { multiplier: 1 / 240, unit: "cup", normalized_unit: "ml" },
  "milliliter": { multiplier: 1 / 240, unit: "cup", normalized_unit: "ml" },
  "milliliters": { multiplier: 1 / 240, unit: "cup", normalized_unit: "ml" },
  "g": { multiplier: 1 / 28.35, unit: "oz", normalized_unit: "g" },
  "g.": { multiplier: 1 / 28.35, unit: "oz", normalized_unit: "g" },
  "gram": { multiplier: 1 / 28.35, unit: "oz", normalized_unit: "g" },
  "grams": { multiplier: 1 / 28.35, unit: "oz", normalized_unit: "g" },
  "l": { multiplier: 4.227, unit: "cup", normalized_unit: "l" },
  "l.": { multiplier: 4.227, unit: "cup", normalized_unit: "l" },
  "liter": { multiplier: 4.227, unit: "cup", normalized_unit: "l" },
  "liters": { multiplier: 4.227, unit: "cup", normalized_unit: "l" },
  "kg": { multiplier: 2.205, unit: "lb", normalized_unit: "kg" },
  "kg.": { multiplier: 2.205, unit: "lb", normalized_unit: "kg" },
  "kilogram": { multiplier: 2.205, unit: "lb", normalized_unit: "kg" },
  "kilograms": { multiplier: 2.205, unit: "lb", normalized_unit: "kg" }
};

const imperialDictionary = {
  "cup": { multiplier: 240, unit: "ml", normalized_unit: "cup" },
  "cup.": { multiplier: 240, unit: "ml", normalized_unit: "cup" },
  "cups": { multiplier: 240, unit: "ml", normalized_unit: "cup" },
  "oz": { multiplier: 28.35, unit: "g", normalized_unit: "oz" },
  "oz.": { multiplier: 28.35, unit: "g", normalized_unit: "oz" },
  "ounce": { multiplier: 28.35, unit: "g", normalized_unit: "oz" },
  "ounces": { multiplier: 28.35, unit: "g", normalized_unit: "oz" },
  "gallon": { multiplier: 3.785, unit: "l", normalized_unit: "gallon" },
  "gal": { multiplier: 3.785, unit: "l", normalized_unit: "gallon" },
  "gal.": { multiplier: 3.785, unit: "l", normalized_unit: "gallon" },
  "lb": { multiplier: 0.454, unit: "kg", normalized_unit: "lb" },
  "lb.": { multiplier: 0.454, unit: "kg", normalized_unit: "lb" },
  "pound": { multiplier: 0.454, unit: "kg", normalized_unit: "lb" },
  "pounds": { multiplier: 0.454, unit: "kg", normalized_unit: "lb" },
  "tsp": { multiplier: 4.929, unit: "ml", normalized_unit: "tsp" },
  "tsp.": { multiplier: 4.929, unit: "ml", normalized_unit: "tsp" },
  "teaspoon": { multiplier: 4.929, unit: "ml", normalized_unit: "tsp" },
  "teaspoons": { multiplier: 4.929, unit: "ml", normalized_unit: "tsp" },
  "tbl": { multiplier: 14.787, unit: "ml", normalized_unit: "tbsp" },
  "tbsp": { multiplier: 14.787, unit: "ml", normalized_unit: "tbsp" },
  "tbsp.": { multiplier: 14.787, unit: "ml", normalized_unit: "tbsp" },
  "tablespoon": { multiplier: 14.787, unit: "ml", normalized_unit: "tbsp" },
  "tablespoons": { multiplier: 14.787, unit: "ml", normalized_unit: "tbsp" }
};

const convert = (unit, quantity) => {

  if (unit) {
    const normalizedUnit = unit.unit;
    return {
      quantity: roundToFraction((quantity * unit.multiplier).toFixed(2)),
      unit: normalizedUnit,
    };
  }

  // logger.error(`Conversion failed for quantity: ${quantity}, unit: ${unit}`);
  return { quantity: roundToFraction(quantity.toFixed(2)), unit };
};

const isImperialUnit = (unit) => {
  return imperialDictionary.hasOwnProperty(unit.toLowerCase());
};

const isMetricUnit = (unit) => {
  return metricDictionary.hasOwnProperty(unit.toLowerCase());
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

module.exports = {
  isImperialUnit,
  isMetricUnit,
  roundToFraction,
  convert,
  imperialDictionary,
  metricDictionary
};
