import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

// отримати всі нотатки
export const getNotes = async (req, res) => {
    const notes = await Note.find();
    res.status(200).json(notes);
};

// отримати одну нотатку за id
export const getNoteById = async (req, res) => {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(note);
};

// зчитування даних з req.body
export const createNote = async (req, res) => {
        const note = await Note.create(req.bosy);
        res.status(201).json(note);
    };

//delete
export const deleteNote = async (req, res, next) => {
    const { noteId } = req.params;
    const note = await Note.findOneAndDelete({
        _id: noteId,
    });
    if (!note) {
        next(createHttpError(404, 'Note not found'));
        return;
    }
    res.status(200).json(note);
};

//patch (update)
export const updateNote = async (req, res, next) => {
    const { noteId } = req.params;

    const note = await Note.findOneAndUpdate(
        { _id: noteId },
        req.bode,
        { new: true },
    );
    if (!note) {
        next(createHttpError(404, 'Note not found'));
        return;
    };
    res.status(200).json(note);
};