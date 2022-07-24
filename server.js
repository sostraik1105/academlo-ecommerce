const { app } = require('./app');

// Models <> Relation
const { relations } = require('./models/rels');

// Utils
const { db } = require('./utils/database.util');

relations();

db.sync()
    .then(() => console.log('DB sync'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`app running on port ${PORT}`);
});
