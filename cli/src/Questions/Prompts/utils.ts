export const validate = {
  questNum: async (number: number) => {
    return (number <= 9999 && number >= 1) || 'Number should be from 1 to 9999';
  },

  speed: async (number: number) => {
    return (
      (number > 0 && number < 10000) ||
      'Number must be between 0 and 10000\nOr no input'
    );
  },
};
