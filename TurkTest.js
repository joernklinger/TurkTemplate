var express = require('express');
var app = express();

app.use(require('body-parser')());

var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);

var answered = {};

// Routes
app.get('/', function(req, res) {
    if (answered[req.query.workerId]) {
        console.log('worker exists');
        if (answered[req.query.workerId] < 11) {
            console.log('less than 10 trials');
            renderExp(res, req);
        } else {
            console.log('10 trials - aborting');
            renderOutro(res, req);
        }

    } else {
        console.log('new worker');
        answered[req.query.workerId] = 0;
        renderIntro(res, req);
    }
 });

app.post('/annotate', function(req, res) {
    var response = req.body.data;
    console.log(response);
    console.log('workerIdPost: ' + req.body.workerIdPost);
    answered[req.body.workerIdPost]++;
    console.log('Questions answered: ' + answered[req.query.workerId]);
});



function renderIntro(res, req) {
    console.log(req.query.workerId);
    res.render('intro', {
        worker: req.query.workerId,
        introText: 'Trial 0, instructions'
        }
    );
}

function renderExp(res, req) {
    trial_to_show = answered[req.query.workerId];
    res.render('exp', {
        worker: req.query.workerId,
        trial: trial_to_show
        }
    );
}

function renderOutro(res, req) {
    trial_to_show = answered[req.query.workerId] - 1;
    // reset that worker
    answered[req.query.workerId] = undefined;
    res.render('outro', {
        worker: req.query.workerId,
        trial: trial_to_show
        }
    );
}

// Start server
var server = app.listen(app.get('port'), function() {
    console.log('Express started on locahost:' +
    app.get('port') + '; press Ctrl-C to terminate.');
});
