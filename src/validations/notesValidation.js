import { Joi, Segments } from 'celebrate';
import { TAGS } from '../constants/tags.js';
import { isValidObjectId } from 'mongoose';

export const getAllNotesSchema = {
    [Segments.QUERY]: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        perPage: Joi.number().integer().min(5).max(20).default(10),
        tag: Joi.string().valid(...TAGS),
        search: Joi.string().allow('')
    })
    
};

const objectIdValidator = (value, helpers) => {
    return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const noteIdSchema = {
    [Segments.PARAMS]: Joi.object({
        noteId: Joi.string().custom(objectIdValidator).required(),
    }),
};

export const createNoteSchema = {
    [Segments.BODY]: Joi.object({
        title: Joi.string().min(1).required().messages({
            "string.base": "Title must be a string",
            "string.min": "Title should have at least {#limit} characters",
            "any.required": "Title is required",
        }),
        content: Joi.string().allow(''),
        tag: Joi.string().valid(...TAGS).messages({
        "any.only": "Tag must be one of tags",
    }),
    }),
};

export const updateNoteSchema = {
    [Segments.PARAMS]: Joi.object({
        noteId: Joi.string().custom(objectIdValidator).required().messages({
            "string.base": "Id must be a string",
            "string.required": "Id is required",
        }),
    }),
    [Segments.BODY]: Joi.object({
        title: Joi.string().min(1).messages({
            "string.base": "Title must be a string",
            "string.min": "Title should have at least {#limit} characters",
        }),
        content: Joi.string().allow(''),
        tag: Joi.string().valid(...TAGS)
    }),
};