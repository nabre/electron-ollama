import { app } from 'electron';
import * as path from 'path';
import Loki from 'lokijs';

let db: Loki;
let parametri: Collection<Parametro>;

interface Parametro {
  $loki?: number;
  nomeParametro: string;
  [key: string]: any;
}

function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const dbPath: string = path.join(app.getPath('userData'), 'parametri.db');
    
    db = new Loki(dbPath, {
      autoload: true,
      autoloadCallback: () => {
        parametri = db.getCollection('parametri');
        if (parametri === null) {
          parametri = db.addCollection('parametri', { indices: ['nomeParametro'] });
        }
        console.log('Database inizializzato in:', dbPath);
        resolve();
      },
      autosave: true,
      autosaveInterval: 4000
    });
  });
}

function salvaParametri(parametro: Parametro): Promise<Parametro> {
  return new Promise((resolve) => {
    const nuovoDoc = parametri.insert(parametro);
    resolve(nuovoDoc);
  });
}

function recuperaTuttiParametri(): Promise<Parametro[]> {
  return new Promise((resolve) => {
    const docs = parametri.find();
    resolve(docs);
  });
}

function recuperaParametriPerNome(nome: string): Promise<Parametro[]> {
  return new Promise((resolve) => {
    const docs = parametri.find({ nomeParametro: nome });
    resolve(docs);
  });
}

function aggiornaParametri(id: number, nuoviParametri: Partial<Parametro>): Promise<boolean> {
  return new Promise((resolve) => {
    const doc = parametri.get(id);
    if (doc) {
      Object.assign(doc, nuoviParametri);
      parametri.update(doc);
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

function eliminaParametri(id: number): Promise<boolean> {
  return new Promise((resolve) => {
    const doc = parametri.get(id);
    if (doc) {
      parametri.remove(doc);
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

const dbOperations = {
  initializeDatabase,
  salvaParametri,
  recuperaTuttiParametri,
  recuperaParametriPerNome,
  aggiornaParametri,
  eliminaParametri
};

export default dbOperations