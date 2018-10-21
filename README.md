# BlindParty

## Setup
First, fork / clone the repository.

```bash
git clone https://github.com/Coleyra/blindparty.git
cd blindparty
```

Then, install the dependencies (you need nodejs).

```bash
npm install # or alternatively: yarn install
```

Edit and rename the config.sample.js file

Execute the init.sql in your MySQL database

Create a new quizz in the quizz table
```bash
INSERT INTO quizz (id, name) VALUES (NULL, 'Quizz 1');
```

Fill the question table with your music, for example
```bash
INSERT INTO question (id, type, label, answer, diffusion, src, id_quizz) VALUES (NULL, 'youtube', 'What''s the title of the song ?', 'Sandstorm', '0', 'y6120QOlsfU', 1);
```

Run the server
```bash
node server.js
```
## Extra JS libraries
The application use 2 external JS libraries

### Fastclick
https://github.com/ftlabs/fastclick
To remove click delays on browsers with touch UIs

### NoSleep
https://github.com/richtr/NoSleep.js
To Prevent display sleep and enable wake lock in any Android or iOS web browser
