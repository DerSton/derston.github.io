document.addEventListener('DOMContentLoaded', () => {
    $('.selection.dropdown').dropdown();
    $('.ui.checkbox').checkbox();
    $('.container[name="setup"]>.ui.form').form("clear");
    document.querySelector(".page_head>.subtitle").innerText = `Training`;

    fetch("/static/grundausbildung-fragen.json")
        .then(response => response.json())
        .then(fragenkatalog_data => {
            document.getElementById("selectCatalogMenu").innerHTML = ``
            Object.keys(fragenkatalog_data).forEach(key => {
                document.getElementById("selectCatalogMenu").innerHTML += `<div class="item" data-value="${key}">${key}</div>`
            });

            document.getElementById("selectSectionMenu").innerHTML = ``
            $('[name="katalog"]').parent().dropdown({
                onChange: function (value) {
                    $('#selectSectionMenu').dropdown("clear");
                    document.getElementById("selectSectionMenu").innerHTML = ``
                    Object.keys(fragenkatalog_data[value]).forEach((key, index) => {
                        document.getElementById("selectSectionMenu").innerHTML += `<option value="${key}">${index + 1} - ${key}</option>`
                    });
                }
            });

            $('.container[name="setup"]>.ui.form').form({
                fields: {
                    katalog: "empty",
                    abschnitte: "minCount[1]"
                },
                onSuccess: function (event, fields) {
                    event.preventDefault();

                    let katalog = $('input[name="katalog"]').val();
                    let abschnitte = $('#selectSectionMenu').val();
                    let zufallAbschnitte = $('.checkbox input:checkbox').eq(0).is(':checked');
                    let zufallFragen = $('.checkbox input:checkbox').eq(1).is(':checked');
                    let zufallAntworten = $('.checkbox input:checkbox').eq(2).is(':checked');

                    let quiz = abschnitte.reduce((accumulator, key) => {
                        if (key in fragenkatalog_data[katalog]) {
                            accumulator[key] = fragenkatalog_data[katalog][key];
                        }
                        return accumulator;
                    }, {});

                    function mischen(array) {
                        for (let i = array.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [array[i], array[j]] = [array[j], array[i]];
                        }
                        return array;
                    }

                    if (zufallAbschnitte) {
                        const keys = mischen(Object.keys(quiz));
                        quiz = keys.reduce((newQuiz, key) => {
                            newQuiz[key] = quiz[key];
                            return newQuiz;
                        }, {});
                    }

                    if (zufallFragen) {
                        for (let key in quiz) {
                            if (quiz.hasOwnProperty(key)) {
                                quiz[key] = mischen(quiz[key]);
                            }
                        }
                    }

                    if (zufallAntworten) {
                        for (let thema in quiz) {
                            quiz[thema].forEach(item => {
                                item.antworten.sort(() => Math.random() - 0.5);
                            });
                        }
                    }
                    resetQuestion();

                    document.querySelector(".container[name='setup']").style.display = "none"
                    document.querySelector(".container[name='quiz']").style.display = ""

                    displayQuestion(0, 0, quiz);
                }
            });
        })
        .catch(msg => {

        })
});

function resetQuestion() {
    document.querySelector("div[name='answer1']>label").style.color = "";
    document.querySelector("div[name='answer2']>label").style.color = "";
    document.querySelector("div[name='answer3']>label").style.color = "";
    $(".container>form").form("clear");
}

function displayQuestion(section, question, quiz) {
    resetQuestion();
    document.querySelector(".page_head>.subtitle").innerText = Object.keys(quiz)[section];
    questi = quiz[Object.keys(quiz)[section]][question]
    document.querySelector(".question").innerHTML = questi.frage;
    document.querySelector("div[name='answer1']>label").innerHTML = questi.antworten[0].answer
    document.querySelector("div[name='answer2']>label").innerHTML = questi.antworten[1].answer
    document.querySelector("div[name='answer3']>label").innerHTML = questi.antworten[2].answer
    
    document.querySelector(".container[name='quiz']>form>.button").innerHTML = `<a class="ui primary button" onclick='auflösen(${section}, ${question}, ${JSON.stringify(quiz)})'>Auflösen</a>`
}

function auflösen(section, question, quiz) {
    questi = quiz[Object.keys(quiz)[section]][question]
    console.log(questi)
    document.querySelector("div[name='answer1']>label").style.color = questi.antworten[0].correct ? "green" : "red"
    document.querySelector("div[name='answer2']>label").style.color = questi.antworten[1].correct ? "green" : "red"
    document.querySelector("div[name='answer3']>label").style.color = questi.antworten[2].correct ? "green" : "red"
    
    let command;
    if (quiz[Object.keys(quiz)[section]].length > question+1) {
        command = `displayQuestion(${section}, ${question+1}, ${JSON.stringify(quiz)})`
    } else if (quiz[Object.keys(quiz)[section]].length <= question+1 && Object.keys(quiz).length > section+1) {
        command = `displayQuestion(${section+1}, 0, ${JSON.stringify(quiz)})`
    } else {
        command = "location.reload(true);"
    }
    document.querySelector(".container[name='quiz']>form>.button").innerHTML = `<a class="ui primary button" onclick='${command}'>Weiter</a>`
}