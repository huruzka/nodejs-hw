export const notFoundHandler = (err, req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
};