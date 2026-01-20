let coreInfo = [];
let returned = [];

// load in csv data files
Promise.all([
    fetch("data/safod_core_info.csv").then(r => r.text()),
    fetch("data/safod_returned_materials.csv").then(r => r.text())
]).then(([coreCSV, retCSV]) => {
    coreInfo = Papa.parse(coreCSV, { header: true }).data;
    returned = Papa.parse(retCSV, { header: true }).data;
    setupAllSelectors();
});

function setupSelector(id, sections) {
    const sel = document.getElementById(id);
    sel.innerHTML = `<option value="">None</option>` +
        sections.map(s => `<option value="${s}">${s}</option>`).join("");

    sel.addEventListener("change", () => {
        renderSection(id, sel.value);
    });
}

function setupAllSelectors() {
    setupSelector("C1", ["1","2"]);
    setupSelector("C2", ["3","4","5","6"]);
    setupSelector("C3", ["7","8","9"]);
    setupSelector("C4", ["10","11","12","13","14","15","16","17","18","19 and 20"]);
    setupSelector("C5", ["21","22"]);
    setupSelector("C7", ["1","2","3","4","CC"]);

    setupSelector("E1", ["1","2","3","4","5","6","7","8"]);
    setupSelector("E2", ["1","2","3","4","5 and 6"]);

    setupSelector("G1", ["1","2","3","4","5","6"]);
    setupSelector("G2", ["1","2","3","4","5","6","7","8","9"]);
    setupSelector("G3", ["1","2"]);
    setupSelector("G4", ["1","2","3","4","5","6","7"]);
    setupSelector("G5", ["1","2","3","4","5","6","7"]);
    setupSelector("G6", ["1","2","3","4","5","6"]);
}

function renderSection(id, section) {
    const container = document.getElementById(id + "_content");

    if (!section) {
        container.innerHTML = "";
        return;
    }

    const info = coreInfo.find(d => d.ID === id && d.Section === section);
    const inv = returned.filter(d => d.ID === id && d.Section === section);

    if (!info) {
        container.innerHTML = "<p>No data available.</p>";
        return;
    }

    container.innerHTML = buildCoreHTML(info, inv);
}

// generate the dropdown content
function buildCoreHTML(info, inv) {

    // these are the possible categories of retrieved samples
    const groups = {
        "0": { label: "Thin Section" },
        "1": { label: "Rock" },
        "2": { label: "Powder" },
        "3": { label: "Thin Section Billet" },
        "4": { label: "Mini Core" }
    };

    // this is the html for what each content will be
    // variables get filled in from the data in the csv
    let html = `
        <h4><strong>${info.name}</strong></h4>
        <a href="https://app.geosamples.org/sample/igsn/${info.IGSN}" target="_blank">
            IGSN: ${info.IGSN}
        </a>
        <br><br>
        <p><strong>Depth (m):</strong> ${info.top_m} – ${info.bottom_m}</p>
        <p><strong>Depth (ft):</strong> ${info.top_ft} – ${info.bottom_ft}</p>
        <p><strong>Lithology:</strong> ${info.lith}</p>
        <img src="${info.img_path}" style="width:100%; margin-top:1rem;">
        <h5 style="margin-top:2rem;"><strong>Available Returned Materials</strong></h5>
    `;

    // this formats and adds the relevant information for each returned sample
    Object.entries(groups).forEach(([type, meta]) => {
        const items = inv.filter(r => r.Type === type);
        if (items.length > 0) {
            html += `<h6><strong>${meta.label}:</strong></h6><ul>`;
            items.forEach(r => {
                const dist = r.dist_from_top;
                const igsn = r.IGSN;
                html += `
                    <li>${dist} (<a href="https://app.geosamples.org/sample/igsn/${igsn}" target="_blank">${igsn}</a>)</li>
                `;
            });
            html += `</ul>`;
        }
    });

    return html;
}
