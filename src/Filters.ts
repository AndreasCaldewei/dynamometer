export interface Filter {
  KeyConditionExpression?: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, string>;
}

interface FilerFunctionArgs {
  sortKey: string;
}

export type FilterFunction = (args: FilerFunctionArgs) => Filter;

function Equal(value: string | number) {
  return (args: FilerFunctionArgs) => {
    return {
      KeyConditionExpression: '#SK = :SK',
      ExpressionAttributeNames: { '#SK': args.sortKey },
      ExpressionAttributeValues: {
        ':SK': `${value}`,
      },
    } as const;
  };
}

function LessThan(value: string | number) {
  return (args: FilerFunctionArgs) => {
    return {
      KeyConditionExpression: '#SK < :SK',
      ExpressionAttributeNames: { '#SK': args.sortKey },
      ExpressionAttributeValues: {
        ':SK': `${value}`,
      },
    } as const;
  };
}

function GreaterThanOrEqual(value: string | number) {
  return (args: FilerFunctionArgs) => {
    return {
      KeyConditionExpression: '#SK >= :SK',
      ExpressionAttributeNames: { '#SK': args.sortKey },

      ExpressionAttributeValues: {
        ':SK': `${value}`,
      },
    } as const;
  };
}

function Greater(value: string | number) {
  return (args: FilerFunctionArgs) => {
    return {
      KeyConditionExpression: '#SK > :SK',
      ExpressionAttributeNames: { '#SK': args.sortKey },
      ExpressionAttributeValues: {
        ':SK': `${value}`,
      },
    } as const;
  };
}

function LessThanOrEqual(value: string | number) {
  return (args: FilerFunctionArgs) => {
    return {
      KeyConditionExpression: '#SK <= :SK',
      ExpressionAttributeNames: { '#SK': args.sortKey },
      ExpressionAttributeValues: {
        ':SK': `${value}`,
      },
    } as const;
  };
}
function Between(minValue: string | number, maxValue: string | number) {
  return (args: FilerFunctionArgs) => {
    return {
      KeyConditionExpression: '#SK BETWEEN :SKMIN AND :SKMAX',
      ExpressionAttributeNames: { '#SK': args.sortKey },
      ExpressionAttributeValues: {
        ':SKMIN': `${minValue}`,
        ':SKMAX': `${maxValue}`,
      },
    } as const;
  };
}

function BeginsWith(value: string | number) {
  return (args: FilerFunctionArgs) => {
    return {
      KeyConditionExpression: 'begins_with (#SK, :SK )',
      ExpressionAttributeNames: { '#SK': args.sortKey },
      ExpressionAttributeValues: {
        ':SK': `${value}`,
      },
    } as const;
  };
}

export const Filters = {
  Equal,
  LessThan,
  GreaterThanOrEqual,
  Greater,
  LessThanOrEqual,
  Between,
  BeginsWith,
};
