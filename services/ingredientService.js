const { isImperialUnit, isMetricUnit, convertToImperial, convertToMetric, roundToFraction } = require('../lib/units');

const processIngredients = (ingredients) => {
  return ingredients.map(ingredient => {
    let metric = null;
    let imperial = null;
    let other = null;

    ingredient.amount.forEach(amount => {
      if (isMetricUnit(amount.unit)) {
        metric = { quantity: Math.round(amount.quantity), unit: amount.unit };
      } else if (isImperialUnit(amount.unit)) {
        imperial = { quantity: roundToFraction(amount.quantity), unit: amount.unit };
      } else {
        other = { quantity: amount.quantity, unit: amount.unit };
      }
    });

    if (!imperial && metric) {
      imperial = convertToImperial(metric.quantity, metric.unit);
    } else if (!metric && imperial) {
      metric = convertToMetric(imperial.quantity, imperial.unit);
    }

    return {
      ...ingredient,
      metric,
      imperial,
      other
    };
  });
};

const processIngredientsForUpdate = (ingredients) => {
  return ingredients.map(ingredient => {
    let metric = ingredient.metric;
    let imperial = ingredient.imperial;
    let other = ingredient.other;

    if (metric && typeof metric.quantity !== 'number') {
      metric.quantity = parseFloat(metric.quantity);
    }
    if (imperial && typeof imperial.quantity !== 'number') {
      imperial.quantity = parseFloat(imperial.quantity);
    }
    if (other && typeof other.quantity !== 'number') {
      other.quantity = parseFloat(other.quantity);
    }

    if (!imperial && metric) {
      imperial = convertToImperial(metric.quantity, metric.unit);
    } else if (!metric && imperial) {
      metric = convertToMetric(imperial.quantity, imperial.unit);
    }

    return {
      ...ingredient,
      metric,
      imperial,
      other
    };
  });
};

module.exports = {
  processIngredients,
  processIngredientsForUpdate,
};
