const log = console.log.bind(console, '[move-detect.js]');

const Tether = require('tether');
const $ = require('jquery');

$('#svg-container')
.on('mouseleave', 'svg', (e) => {
    // e.currentTarget === e.target && $('#t').empty();
    log('mouseleave', e.target.tagName, e.currentTarget.tagName);
    if ($(e.currentTarget).hasClass('t-mark')) {
        log('not my mouseleave');
        // return;
    }
    $('#t').empty();
})
.on('mouseenter', 'svg', (e) => {
    log('mouseenter', e.target.tagName, e.currentTarget.tagName);
    if ($(e.currentTarget).hasClass('t-mark')) {
        log('not my mouseenter');
        // return;
    }

    const $svg = $(e.target);

    const radar = [150, 150];
    const soffset = $svg.position();

    const allHighlights = $svg.find('rect').toArray();
    const allHighlightsPos = allHighlights.map((rect) => {
        const br = rect.getBoundingClientRect();
        return [
            br.left - soffset.left + br.width / 2,
            br.top - soffset.top + br.height / 2,
        ];
    });

    // const allTetherPre = allHighlights
    // .map((h, i) => {
    //     return makeTetheredMark(makeMark.bind(null, i))(h);
    // });

    log('allHighlights', allHighlightsPos);

    const moveDetect = makeMoveDetect({
        soffset,
        allHighlights,
        allHighlightsPos,
        radar,
    });

    $svg.on('mousemove', (moveEvent) => {
        $('#t').empty();

        allHighlights.forEach(h => {
            $(h).css({
                'stroke': '',
            });
        });

        const hitElements = moveDetect(moveEvent);

        hitElements
        .forEach(h => {
            $(h).css({
                'stroke': 'red',
            });
        });

        const ts = hitElements
        .map((h, i) => {
            return makeTetheredMark(makeMark.bind(null, i))(h);
        });

    });

});

function mark (num) {
    return $('#t').html(num).get(0);
}

function makeMark(num) {
    return $('<div class="abs t-mark">' + num + '</div>').appendTo('#t').get(0);
}

function makeTetheredMark (yellowBoxFn) {
    return function tether (target) {
        return new Tether({
            element: yellowBoxFn(),
            target: target,
            attachment: 'bottom left',
            targetAttachment: 'top left',
        });
    };
}

function makeMoveDetect ({
        soffset,
        allHighlights,
        allHighlightsPos,
        radar,
    }) {
    return function moveDetect (e) {
        const pos = [e.clientX - soffset.left, e.clientY - soffset.top];

        const hitByRadar = allHighlightsPos
        .map((hpos, index) => {
            const distance = [
                Math.abs(hpos[0] - pos[0]),
                Math.abs(hpos[1] - pos[1]),
            ];

            return distance[0] < radar[0] && distance[1] < radar[1]
                ? index
                : null;
        })
        .filter(i => i !== null)
        .map((i, _, arr) => {
            // log('hits', arr);
            return i;
        })
        .map(i => allHighlights[i])

        return hitByRadar;
    }
}
