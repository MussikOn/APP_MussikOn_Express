"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUsersGetAll = adminUsersGetAll;
exports.adminUsersGetById = adminUsersGetById;
exports.adminUsersCreate = adminUsersCreate;
exports.adminUsersUpdate = adminUsersUpdate;
exports.adminUsersRemove = adminUsersRemove;
exports.adminEventsGetAll = adminEventsGetAll;
exports.adminEventsGetById = adminEventsGetById;
exports.adminEventsCreate = adminEventsCreate;
exports.adminEventsUpdate = adminEventsUpdate;
exports.adminEventsRemove = adminEventsRemove;
exports.adminMusiciansGetAll = adminMusiciansGetAll;
exports.adminMusiciansGetById = adminMusiciansGetById;
exports.adminMusiciansUpdate = adminMusiciansUpdate;
exports.adminMusiciansRemove = adminMusiciansRemove;
exports.adminImagesGetAll = adminImagesGetAll;
exports.adminImagesGetById = adminImagesGetById;
exports.adminImagesRemove = adminImagesRemove;
exports.adminMusicianRequestsGetAll = adminMusicianRequestsGetAll;
exports.adminMusicianRequestsGetById = adminMusicianRequestsGetById;
exports.adminMusicianRequestsRemove = adminMusicianRequestsRemove;
exports.adminMusicianRequestsUpdate = adminMusicianRequestsUpdate;
const firebase_1 = require("../utils/firebase");
// --- Usuarios ---
function adminUsersGetAll(req, res, next) {
    firebase_1.db.collection('users').get()
        .then(snapshot => {
        const users = [];
        snapshot.forEach(doc => users.push(Object.assign({ _id: doc.id }, doc.data())));
        res.status(200).json(users);
    })
        .catch(next);
}
function adminUsersGetById(req, res, next) {
    firebase_1.db.collection('users').doc(req.params.id).get()
        .then(doc => {
        if (!doc.exists) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        res.status(200).json(Object.assign({ _id: doc.id }, doc.data()));
    })
        .catch(next);
}
function adminUsersCreate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('users').add(data)
        .then(ref => { res.status(201).json(Object.assign({ _id: ref.id }, data)); })
        .catch(next);
}
function adminUsersUpdate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('users').doc(req.params.id).update(data)
        .then(() => { res.status(200).json({ message: 'Usuario actualizado' }); })
        .catch(next);
}
function adminUsersRemove(req, res, next) {
    firebase_1.db.collection('users').doc(req.params.id).delete()
        .then(() => { res.status(200).json({ message: 'Usuario eliminado' }); })
        .catch(next);
}
// --- Eventos ---
function adminEventsGetAll(req, res, next) {
    firebase_1.db.collection('events').get()
        .then(snapshot => {
        const events = [];
        snapshot.forEach(doc => events.push(Object.assign({ _id: doc.id }, doc.data())));
        res.status(200).json(events);
    })
        .catch(next);
}
function adminEventsGetById(req, res, next) {
    firebase_1.db.collection('events').doc(req.params.id).get()
        .then(doc => {
        if (!doc.exists) {
            res.status(404).json({ message: 'Evento no encontrado' });
            return;
        }
        res.status(200).json(Object.assign({ _id: doc.id }, doc.data()));
    })
        .catch(next);
}
function adminEventsCreate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('events').add(data)
        .then(ref => { res.status(201).json(Object.assign({ _id: ref.id }, data)); })
        .catch(next);
}
function adminEventsUpdate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('events').doc(req.params.id).update(data)
        .then(() => { res.status(200).json({ message: 'Evento actualizado' }); })
        .catch(next);
}
function adminEventsRemove(req, res, next) {
    firebase_1.db.collection('events').doc(req.params.id).delete()
        .then(() => { res.status(200).json({ message: 'Evento eliminado' }); })
        .catch(next);
}
// --- Músicos ---
function adminMusiciansGetAll(req, res, next) {
    res.status(200).json([]);
    return;
}
function adminMusiciansGetById(req, res, next) {
    res.status(200).json({});
    return;
}
function adminMusiciansUpdate(req, res, next) {
    res.status(200).json({ message: 'Músico actualizado' });
    return;
}
function adminMusiciansRemove(req, res, next) {
    res.status(200).json({ message: 'Músico eliminado' });
    return;
}
// --- Imágenes ---
function adminImagesGetAll(req, res, next) {
    res.status(200).json([]);
    return;
}
function adminImagesGetById(req, res, next) {
    res.status(200).json({});
    return;
}
function adminImagesRemove(req, res, next) {
    res.status(200).json({ message: 'Imagen eliminada' });
    return;
}
// --- Solicitudes de Músico ---
function adminMusicianRequestsGetAll(req, res, next) {
    firebase_1.db.collection('musicianRequests').get()
        .then(snapshot => {
        const requests = [];
        snapshot.forEach(doc => requests.push(Object.assign({ _id: doc.id }, doc.data())));
        res.status(200).json(requests);
    })
        .catch(next);
}
function adminMusicianRequestsGetById(req, res, next) {
    firebase_1.db.collection('musicianRequests').doc(req.params.id).get()
        .then(doc => {
        if (!doc.exists) {
            res.status(404).json({ message: 'Solicitud no encontrada' });
            return;
        }
        res.status(200).json(Object.assign({ _id: doc.id }, doc.data()));
    })
        .catch(next);
}
function adminMusicianRequestsRemove(req, res, next) {
    firebase_1.db.collection('musicianRequests').doc(req.params.id).delete()
        .then(() => { res.status(200).json({ message: 'Solicitud eliminada' }); })
        .catch(next);
}
function adminMusicianRequestsUpdate(req, res, next) {
    const data = req.body;
    firebase_1.db.collection('musicianRequests').doc(req.params.id).update(data)
        .then(() => { res.status(200).json({ message: 'Solicitud actualizada' }); })
        .catch(next);
}
