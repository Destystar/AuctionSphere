import { database } from './firebase';

export function create(request, response) {
  const data = request.body;
  const ref = database.ref().child('items');
  const item = ref.push();
  item.set(data, (error) => {
    if (error) {
      response.status(500).send({ error });
    } else {
      response.send({ id: item.key });
    }
  });
}

export function read(request, response) {
  const id = request.params.id;
  const ref = database.ref(`items/${id}`);
  ref.once('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      response.send(data);
    } else {
      response.status(404).send({ error: 'Item not found' });
    }
  });
}

export function update(request, response) {
  const id = request.params.id;
  const data = request.body;
  const ref = database.ref(`items/${id}`);
  ref.set(data, (error) => {
    if (error) {
      response.status(500).send({ error });
    } else {
      response.send({ id });
    }
  });
}

export function dbdelete(request, response) {
  const id = request.params.id;
  const ref = database.ref(`items/${id}`);
  ref.remove((error) => {
    if (error) {
      response.status(500).send({ error });
    } else {
      response.send({ id });
    }
  });
}

export function list(request, response) {
  const ref = database.ref('items');
  ref.once('value', (snapshot) => {
    const data = snapshot.val();
    response.send(data);
  });
}