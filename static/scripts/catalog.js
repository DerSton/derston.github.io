document.addEventListener('DOMContentLoaded', () => {
    fetch("/static/grundausbildung-fragen.json")
        .then(response => response.json())
        .then(fragenkatalog_data => {
            const urlParams = new URLSearchParams(window.location.search);
            const katalog = urlParams.get('katalog');

            if (katalog !== null && katalog !== '' && fragenkatalog_data.hasOwnProperty(katalog)) {
                document.getElementById("selectCatalog").style.display = "none";
                document.getElementById("displayCatalog").style.display = "";

                document.title = `Fragenkataloge ${katalog}`;
                document.querySelector(".page_head>.subtitle").innerText = `Fragenkatalog ${katalog}`;
                document.getElementById("displayCatalog").innerHTML = ``

                Object.keys(fragenkatalog_data[katalog]).forEach((key, index) => {
                    let new_element = document.createElement("div");
                    new_element.innerHTML += `<h3>${index + 1} ${key}</h3>`

                    fragenkatalog_data[katalog][key].forEach((element, id) => {
                        new_element.innerHTML += `<div>
                        <b>${index + 1}.${id + 1}</b> ${element.frage}
                        <div class="${element.antworten[0].correct ? 'correct' : 'wrong'} answer"><b>A</b> ${element.antworten[0].answer}</div>
                        <div class="${element.antworten[1].correct ? 'correct' : 'wrong'} answer"><b>B</b> ${element.antworten[1].answer}</div>
                        <div class="${element.antworten[2].correct ? 'correct' : 'wrong'} answer"><b>C</b> ${element.antworten[2].answer}</div>
                    </div>`
                    })
                    document.getElementById("displayCatalog").appendChild(new_element);
                });
                document.getElementById("displayCatalog").innerHTML += `<a class="ui primary button" href="/catalog" style="position: fixed;left: 20px;bottom: 20px;">Zurück</a>`
            } else {
                document.getElementById("selectCatalog").style.display = "";
                document.getElementById("displayCatalog").style.display = "none";

                document.title = `Fragenkataloge`;
                document.querySelector(".page_head>.subtitle").innerText = `Fragenkataloge`;
                document.querySelector("#selectCatalog.container>div").innerHTML = ``
                Object.keys(fragenkatalog_data).forEach(element => {
                    document.querySelector("#selectCatalog.container>div").innerHTML += `<a class="ui primary button" href="/catalog/?katalog=${element}">${element}</a>`
                });
            }
        })
        .catch(msg => {

        })
});