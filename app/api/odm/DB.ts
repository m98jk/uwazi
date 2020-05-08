import mongoose from 'mongoose';

type dbAuth = {
  user: string;
  pass: string;
};

const getConnection = () => mongoose.connections[0];

const connect = async (uri: string, auth?: dbAuth) => {
  await mongoose.connect(uri, {
    ...auth,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  });
  return getConnection();
};

export { connect, getConnection };
