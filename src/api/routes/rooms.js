import express from 'express';
import ActiveRooms from '../models/ActiveRooms.js';

const router = express.Router();

// Check if room id exists
router.get('/room/:id', (req, res) => {
    const { id } = req.params;
    ActiveRooms.findOne({ RoomID: id.toUpperCase() }).then((room) => {
        console.log(room);
        if (!room) {
            res.status(404).send('Room not found');
            return;
        }
        res.status(200).send({'Room Exists': id});
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Internal Server Error');
    });
});

// Create a new room
router.post('/create/room/:id', (req, res) => {
    const { id } = req.body;
    ActiveRooms.create({ RoomID: id.toUpperCase() }).then((room) => {
        res.status(200).send({'Room Created': id});
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Internal Server Error');
    });
});

// Delete a room
router.delete('/delete/room/:id', (req, res) => {
    const { id } = req.params;
    ActiveRooms.deleteOne({ RoomID: id.toUpperCase() }).then((room) => {
        res.status(200).send({'Room Deleted': id});
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Internal Server Error');
    });
});

export default router;