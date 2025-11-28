import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

// отримати всі нотатки
export const getAllNotes = async (req, res, next) => {
    try {
        const { page = 1, perPage = 15, tag, search } = req.query;
        const skip = (page - 1) * perPage;

        // Формуємо обʼєкт фільтра
        const filter = {userId: req.user._id};

        // Фільтр по тегу
        if (tag) {
            filter.tag = tag;
        }

        // Пошук по $text
        if (search) {
            filter.$text = { $search: search };
        }

        // Формуємо запит
        const notesQuery = Note.find(filter);

        const [totalNotes, notes] = await Promise.all([
            Note.countDocuments(filter),                 // рахуємо кількість з фільтрами
            notesQuery.skip(skip).limit(perPage),        // пагінація
        ]);

        const totalPages = Math.ceil(totalNotes / perPage);

        res.status(200).json({
            page: Number(page),
            perPage: Number(perPage),
            totalNotes,
            totalPages,
            notes,
        });
    } catch (error) {
        next(error);
    }
};

// отримати одну нотатку за id
export const getNoteById = async (req, res, next) => {
    try {
        const { noteId } = req.params;
        const note = await Note.findOne({
            _id: noteId,
            userId: req.user._id,
        });
        if (!note) {
            return next(createHttpError(404, 'Note not found'));
        }
        res.status(200).json(note);
    } catch (error) {
        next(error);
    }
};

// створення нотатки
export const createNote = async (req, res, next) => {
    try {
        const note = await Note.create({
            ...req.body,
            userId: req.user._id,
        });
        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
};

// delete
export const deleteNote = async (req, res, next) => {
    const { noteId } = req.params;
    const note = await Note.findOneAndDelete({
        _id: noteId,
        userId: req.user._id,
    });

    if (!note) {
        return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
};

// update (patch)
export const updateNote = async (req, res, next) => {
    const { noteId } = req.params;

    const note = await Note.findOneAndUpdate({
            _id: noteId,
            userId: req.user._id,
         },
        req.body,
        { new: true }
    );

    if (!note) {
        return next(createHttpError(404, 'Note not found'));
    }

    res.status(200).json(note);
};
