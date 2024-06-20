const { isImperialUnit, isMetricUnit, convert, roundToFraction, imperialDictionary, metricDictionary } = require('../utils/units');
const logger = require('../utils/logger');

const processIngredients = (ingredients) => {
  return ingredients.map(ingredient => {
    let metric = null;
    let imperial = null;
    let other = null;

    ingredient.amount.forEach(amount => {
      let unit = amount.unit.toLowerCase();
      let quantity = amount.quantity;
      logger.error(`Converting - ${JSON.stringify(amount)}`);

      // Extract unit from quantity if not present separately
      if (!unit) {
        const unitMatch = (typeof quantity === 'string' ? Object.keys(imperialDictionary).find(u => quantity.toLowerCase().includes(u)) : undefined) ||
                          (typeof quantity === 'string' ? Object.keys(metricDictionary).find(u => quantity.toLowerCase().includes(u)) : undefined);
        if (unitMatch) {
          unit = unitMatch.toLowerCase();
          quantity = parseFloat(quantity.replace(unitMatch, '').trim());
        }
      }
logger.error(`Converted ${JSON.stringify({unit, quantity})}`);
      console.log(unit,'<-unit1');
      console.log(quantity,'<-quantity1');
      // console.log(imperialDictionary[unit].normalized_unit,'<-imperialDictionary[unit].normalized_unit');
      // console.log(imperialDictionary[unit].normalized_unit,'<-imperialDictionary[unit].normalized_unit');

      if (unit && isMetricUnit(unit)) {
        metric = { quantity: Math.round(quantity), unit: metricDictionary[unit].normalized_unit };
      } else if (unit && isImperialUnit(unit)) {
        imperial = { quantity: roundToFraction(quantity), unit: imperialDictionary[unit].normalized_unit };
      } else {
        other = { quantity: quantity, unit: unit };
      }
    });

    console.log(metric,'<-metric1');
    console.log(imperial,'<-imperial1');
    // console.log(imperialDictionary[imperial.unit],'<-imperialDictionary[imperial.unit]1');

    if (!imperial && metric) {
      imperial = convert(metricDictionary[metric.unit], metric.quantity);
    } else if (!metric && imperial) {
      metric = convert(imperialDictionary[imperial.unit], imperial.quantity);
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
      imperial = convert(imperialDictionary, metric.quantity, metric.unit);
    } else if (!metric && imperial) {
      metric = convert(metricDictionary, imperial.quantity, imperial.unit);
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
