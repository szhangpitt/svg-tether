const log = console.log.bind(console, '[delete.js]');

const Rx = require('rxjs/Rx');
const $ = require('jquery');
const $svg = $('svg');

const removeButtonClick$ =
Rx.Observable.fromEvent(
    document.querySelector('button#remove-btn'),
    'click');

const clickHighlight$ =
Rx.Observable.fromEventPattern(
    function add (h) {
        $svg.on('click', 'rect', h);
    },
    function remove (h) {
        $svg.off('click', 'rect', h);
    }
);

const keyup$ =
Rx.Observable.fromEventPattern(
    function add (h) {
        $('body').on('keyup', h);
    },
    function remove (h) {
        $('body').off('keyup', h);
    }
);

const clickTargetCollection$ =
clickHighlight$
.scan((accu, clickEvent) => {
    const existingIndex = accu.indexOf(clickEvent.target);

    if (clickEvent.metaKey) {
        if (existingIndex === -1) {
            return accu.concat(clickEvent.target);
        }

        return accu.slice(0, existingIndex)
            .concat(accu.slice(existingIndex + 1));
    }

    return existingIndex === -1
        ? [clickEvent.target]
        : [];

}, [])
.do(console.log.bind(console, 'clickTargetCollection$'))
.share();

const activeHighlightsId$ =
clickTargetCollection$
.map(targets => targets.map(t => t.id))
.startWith([])
.do(x => console.log('activeHighlightsId', x))

const dkeyup$ =
keyup$
.do(x => console.log('keyup', x.which))
.filter(e => e.which === 68 || e.which === 8)

const removeIdsWithD$ =
activeHighlightsId$
// .takeWhile()
.sample(dkeyup$)
.do(ids => { console.log('delete these', ids); });

const removeIdWithButton$ =
activeHighlightsId$
.sample(removeButtonClick$)
.do(ids => { console.log('delete these', ids); });

removeIdsWithD$
.merge(removeIdWithButton$)
.subscribe(ids => {
    ids
    .map(id => document.getElementById(id))
    .map($)
    .forEach($id => {
        $id.remove();
    });
});

clickTargetCollection$
.subscribe((ts) => {
    $('svg > rect').css({ fill: 'green' });
    ts.forEach(t => {
        $(t).css({ fill: 'purple' });
    });
});


