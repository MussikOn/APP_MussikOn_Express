import { authUserRegister, UpdateUser, User } from '../utils/DataTypes';
import { db } from '../utils/firebase';
import * as admin from 'firebase-admin';
import { logger } from '../services/loggerService';

export const registerModel = async (
  name: string,
  lastName: string,
  roll: string,
  userEmail: string,
  userPassword: string,
  status: boolean = true
) => {
  try {
    if (!name || !lastName || !roll || !userEmail || !userPassword) {
      console.info(
        'Hay campos que no han sido llenados, \n verificar codigo en C:/programacion/Express/MusikOn/src/models/authModel.ts linea 4.'
      );
      return 'Hay campos que no han sido llenados';
    }
    const newUser: authUserRegister = {
      name,
      lastName,
      roll,
      userEmail: userEmail.toLocaleLowerCase(),
      userPassword,
      create_at: Date().toString(),
      update_at: '',
      delete_at: '',
      status,
    };
    const querySnapshot = await db
      .collection('users')
      .where('userEmail', '==', userEmail)
      .get();
    if (!querySnapshot.empty) {
      return 'El usuario ya Existe.';
    }

    await db.collection('users').doc(userEmail).set(newUser);
    return false;
  } catch (error) {
    console.info(
      '[src/models/authModel.ts:25] Error al Guardar los datos, \n verificar codigo en C:/programacion/Express/MusikOn/src/models/authModel.ts linea 4.'
    );
    return 'Error al Guardar los datos.';
  }
};

export const getUserByEmailModel = async (userEmail: string) => {
  try {
    if (!userEmail) {
      return null;
    }
    const querySnapshot = await db
      .collection('users')
      .where('userEmail', '==', userEmail.toLocaleLowerCase())
      .get();
    const data = querySnapshot.docs[0].data();
    return data;
  } catch (error) {
    logger.info('Error en getUserByEmailModel:', { context: 'AuthModel', metadata: { error: String(error) } });
    console.log(
      '[src/models/authModel.ts:41] Ubicación: ./src/models/authModel.ts linea 41'
    );
    console.info(
      '[src/models/authModel.ts:42] Error en la peticion getUserByEmail.\n\n'
    );
    return null;
  }
};

export const updateUserByEmailModel = async (
  userEmail: string,
  updatedData: Partial<UpdateUser>
) => {
  try {
    if (!userEmail || !updatedData) {
      console.info(
        '[src/models/authModel.ts:50] Faltan datos para actualizar.'
      );
      return 'Faltan datos para actualizar.';
    }

    await db
      .collection('users')
      .doc(userEmail.toLowerCase())
      .update({
        ...updatedData,
        update_at: new Date().toString(),
      });

    return false;
  } catch (error) {
    logger.info('Error en updateUserByEmailModel:', { context: 'AuthModel', metadata: { error: String(error) } });
    console.log(
      '[src/models/authModel.ts:62] Ubicación: ./src/models/authModel.ts linea 62'
    );
    console.info('[src/models/authModel.ts:63] Error al actualizar los datos.');
    return 'Error al actualizar los datos.';
  }
};

export const addEventToUserModel = async (
  userEmail: string,
  eventData: any
) => {
  try {
    if (!userEmail || !eventData) {
      return 'Faltan datos para guardar el evento.';
    }
    const userRef = db.collection('users').doc(userEmail.toLowerCase());
    // Agrega el evento al array 'createdEvents' del usuario
    await userRef.update({
      createdEvents: admin.firestore.FieldValue.arrayUnion(eventData),
      update_at: new Date().toString(),
    });
    return false;
  } catch (error) {
    logger.info('Error en addEventToUserModel:', { context: 'AuthModel', metadata: { error: String(error) } });
    console.log(
      '[src/models/authModel.ts:82] Ubicación: ./src/models/authModel.ts linea 82'
    );
    console.info(
      '[src/models/authModel.ts:83] Error al guardar el evento en el usuario.'
    );
    return 'Error al guardar el evento.';
  }
};

export const deleteUserByEmailModel = async (userEmail: string) => {
  try {
    if (!userEmail) return 'Falta el email';
    const doc = await db.collection('users').doc(userEmail.toLowerCase()).get();
    if (!doc.exists) return 'not_found';
    await db.collection('users').doc(userEmail.toLowerCase()).delete();
    return false;
  } catch (error) {
    logger.info('Error en deleteUserByEmailModel:', { context: 'AuthModel', metadata: { error: String(error) } });
    console.log(
      '[src/models/authModel.ts:97] Ubicación: ./src/models/authModel.ts linea 97'
    );
    console.info(
      '[src/models/authModel.ts:98] Error al eliminar el usuario:',
      error
    );
    return 'Error al eliminar el usuario';
  }
};
