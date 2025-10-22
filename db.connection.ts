import mongoose from 'mongoose'

export const ConnectDB = (): void => {
    mongoose.connect('mongodb://localhost:27017')
    .then(() => {
        console.log('DB connected successfully');
    })
    .catch((err) => {
        console.log("DB connection failed =>", err);
    });
}