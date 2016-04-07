
import Joi from 'joi';

export const schema = Joi.object({
  description: Joi.string().required()
});
