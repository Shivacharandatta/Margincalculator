document.addEventListener('DOMContentLoaded', function () {
    const clientDropdown = document.getElementById('client-dropdown');
    const inputFieldsSection = document.getElementById('input-fields');
    const resultsSection = document.getElementById('results');
    const resultOutput = document.getElementById('result-output');

let capgLegend = document.getElementById('capg-legend');
    if (!capgLegend) {
        capgLegend = document.createElement('div');
        capgLegend.id = 'capg-legend';
        capgLegend.style.marginTop = '20px';
        capgLegend.style.display = 'none';
        inputFieldsSection.after(capgLegend); // ✅ place it right after input section
    }

    const clientData = {
        "Sony": {
  labels: ["Bill rate(Monthly)", "ECTC(Annually)"],
  calculate: function (billRate, ectc) {
    const margin = (billRate - (billRate * 0.05)) - (ectc / 12);
    const marginColor = margin >= 35000 ? 'green' : 'red';
    return [
      { label: "📉 Adjusted Bill Rate (5% deduction)", value: `₹${(billRate - billRate * 0.05).toFixed(2)}` },
      { label: "📊 Monthly Margin", value: `₹${margin.toFixed(2)}`, color: marginColor }
    ];
  }
},
"HCL": {
   labels: ["ECTC (Annually)", "Markup %", "Bill Rate Given by Client (Monthly)"],
  defaultValues: [null, 18, null],
  calculate: function (ectc, markup, clientBillRate) {
    const billRate = (ectc + (ectc * markup) / 100) / 12;
    const monthlyMargin = billRate - (ectc / 12);
    const annualMargin = monthlyMargin * 12;
    const monthlyCTC = ectc/12;
    const monthlyMarginColor = monthlyMargin >= 35000 ? 'green' : 'red';

    let rows = [
      { label: "💵Billrate (Monthly)", value: `₹${billRate.toFixed(2)}` },
      { label: "📊Monthly Margin", value: `₹${monthlyMargin.toFixed(2)}`, color: monthlyMarginColor },
      { label: "📊Annual Margin", value: `₹${annualMargin.toFixed(2)}` }
    ];

   if (clientBillRate && clientBillRate > billRate) {
      const bufferAmount = clientBillRate - billRate;
      rows.push({
        label: "📦Buffer Amount",
        value: `₹${bufferAmount.toFixed(2)}`,
	color: 'green'
      });
    }

    if (clientBillRate && billRate > clientBillRate) {
      const exceededAmount = billRate - clientBillRate;
      rows.push({
        label: "⚠️Warning",
        value: `Exceeds Client Rate by ₹${exceededAmount.toFixed(2)}`,
        color: 'red'
      });
    }

    return rows;
  }
},
        "Diageo": {
    labels: ["Bill rate(daily)", "Markup %"],
    defaultValues: [null, 25],
    calculate: function (billRate, markUp) {
        const candidateOffer = (billRate / (1 + markUp / 100)) * 227;
        const hourlyRate = billRate / (1 + markUp / 100);
        const margin = (billRate - (billRate / (1 + markUp / 100))) * 18.91667;
        const marginColor = margin >= 35000 ? 'green' : 'red';

        return [
            { label: "💼 Candidate can be offered", value: `₹${candidateOffer.toFixed(2)}` },
            { label: "💵 Candidate daily rate", value: `₹${hourlyRate.toFixed(2)}` },
            { label: "📊 Margin", value: `₹${margin.toFixed(2)}`, color: marginColor }
        ];
    }
},
        "Lowes": {
  labels: ["Bill rate(Hourly)", "MSP %", "ECTC(Annually)"],
  defaultValues: [null, 3, null],
  calculate: function (billRate, msp, ectc) {
    const margin = ((billRate * 160) * (1 - (msp / 100))) - (ectc / 12);
    const marginColor = margin >= 35000 ? 'green' : 'red';
    return [
      { label: "💵 Adjusted Monthly Bill Rate (after MSP)", value: `₹${((billRate * 160) * (1 - msp / 100)).toFixed(2)}` },
      { label: "📊 Monthly Margin", value: `₹${margin.toFixed(2)}`, color: marginColor }
    ];
  }
},
	"Infosys": {
  labels: ["Bill rate(daily)", "ECTC"],
  calculate: function (billRate, ectc) {
    const margin = (billRate * 20) - (ectc / 12);
    const marginColor = margin >= 35000 ? 'green' : 'red';
    return [
      { label: "💵 Monthly Bill Rate", value: `₹${(billRate * 20).toFixed(2)}` },
      { label: "📊 Monthly Margin", value: `₹${margin.toFixed(2)}`, color: marginColor }
    ];
  }
},
"Capg": {
  labels: ["ECTC", "Experience"],
  calculate: function (ectc, experience) {
    const dailyrate = (((ectc * 0.1 + ectc)) / 12) / 22;
    const margin = dailyrate * 0.35 * 22;
    const billRateWithoutTaxes = dailyrate + (margin/22);
    const billRateWithTaxes = billRateWithoutTaxes * 1.18;
    const marginColor = margin >= 35000 ? 'green' : 'red';

    const limits = {
      "4 to 6": 6312,
      "6 to 8": 8490,
      "8 to 10": 11820,
      "10 to 12": 14180,
      "12 +": 16272
    };

    const rows = [
      { label: "💵 Bill Rate (without taxes)", value: `₹${billRateWithoutTaxes.toFixed(2)}` },
      { label: "💵 Bill Rate (with 18% taxes)", value: `₹${billRateWithTaxes.toFixed(2)}` },
      { label: "📊 Margin", value: `₹${margin.toFixed(2)}`, color: marginColor }
    ];

    if (limits[experience] && billRateWithoutTaxes > limits[experience]) {
      rows.push({
        label: "🚫 Warning",
        value: `You can't submit the candidate as you are exceeding the allowed rate for "${experience}"`,
        color: "red"
      });
    }

    return rows;
  }
},
 "Trane Technologies": {
  labels: ["Bill rate(Hourly)", "ECTC(Annually)"],
  calculate: function (billRate, ectc) {
    const margin = ((billRate * 160 * 12) - ectc) / 12;
    const monthlyRate = billRate * 160;
    const marginColor = margin >= 35000 ? 'green' : 'red';

    return [
      { label: "💵 Monthly Bill Rate", value: `₹${monthlyRate.toFixed(2)}` },
      { label: "📊 Monthly Margin", value: `₹${margin.toFixed(2)}`, color: marginColor }
    ];
  }
}
};

    function convertECTC(value) {
        value = parseFloat(value);
        if (isNaN(value)) return 0;
        if (value <= 100) return value * 100000;
        if (value <= 3500) return value * 160 * 12;
        if (value > 3500 && value < 20000) return value * 20 * 12;
        return value * 12;
    }

    function getECTCUnit(value) {
        value = parseFloat(value);
        if (isNaN(value)) return '';
        if (value <= 100) return 'LPA';
        if (value <= 3500) return 'Hourly';
        if (value > 3500 && value < 20000) return 'Per day';
        return 'Monthly';
    }
function showCapgLegend(show = true) {
    const legendContainer = document.getElementById('capg-legend');
    if (!legendContainer) return;

    if (!show) {
        legendContainer.style.display = 'none';
        legendContainer.innerHTML = '';
        return;
    }

    legendContainer.innerHTML = `
        <h3 style="font-weight:bold;margin-bottom:10px;">📘 Capgemini CTC Offering Guidelines</h3>
        <table style="border-collapse: collapse; width: 100%; text-align: center; font-size: 14px;">
            <thead style="background-color: #f0f0f0;">
                <tr>
                    <th style="border: 1px solid #ccc; padding: 8px;">Experience</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Grade</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">Per Day Rate (Excl. Taxes)</th>
                    <th style="border: 1px solid #ccc; padding: 8px;">CTC You Can Offer</th>
                </tr>
            </thead>
            <tbody>
    <tr>
        <td style="border:1px solid #ccc;padding:8px;">12 +</td>
        <td style="border:1px solid #ccc;padding:8px;">D2</td>
        <td style="border:1px solid #ccc;padding:8px;">16,272</td>
        <td style="border:1px solid #ccc;padding:8px;">28.5 LPA</td>
    </tr>
    <tr>
        <td style="border:1px solid #ccc;padding:8px;">10 to 12</td>
        <td style="border:1px solid #ccc;padding:8px;">D1</td>
        <td style="border:1px solid #ccc;padding:8px;">14,180</td>
        <td style="border:1px solid #ccc;padding:8px;">26 LPA</td>
    </tr>
    <tr>
        <td style="border:1px solid #ccc;padding:8px;">8 to 10</td>
        <td style="border:1px solid #ccc;padding:8px;">C2</td>
        <td style="border:1px solid #ccc;padding:8px;">11,820</td>
        <td style="border:1px solid #ccc;padding:8px;">21.5 LPA</td>
    </tr>
    <tr>
        <td style="border:1px solid #ccc;padding:8px;">6 to 8</td>
        <td style="border:1px solid #ccc;padding:8px;">C1</td>
        <td style="border:1px solid #ccc;padding:8px;">8,490</td>
        <td style="border:1px solid #ccc;padding:8px;">15 LPA</td>
    </tr>
    <tr>
        <td style="border:1px solid #ccc;padding:8px;">4 to 6</td>
        <td style="border:1px solid #ccc;padding:8px;">B2</td>
        <td style="border:1px solid #ccc;padding:8px;">6,312</td>
        <td style="border:1px solid #ccc;padding:8px;">11 LPA</td>
    </tr>
</tbody>
        </table>
    `;
    legendContainer.style.display = 'block';
}

    function performCalculation() {
        const selectedClient = clientDropdown.value;
        if (!clientData[selectedClient]) return;

        const inputs = inputFieldsSection.querySelectorAll('input, select');
        let values = [];

        let ectcValid = false;
        let experienceValid = false;

        inputs.forEach(input => {
            if (input.tagName.toLowerCase() === 'select') {
                const val = input.value;
                if (val !== "") {
                    values.push(val);
                    experienceValid = true;
                } else {
                    values.push("");
                }
            } else {
                let val = parseFloat(input.value);
                if (input.dataset.ectc === 'true') val = convertECTC(val);
                if (!isNaN(val) && val > 0) {
                    values.push(val);
                    ectcValid = true;
                } else {
                    values.push(NaN);
                }
            }
        });

        if (selectedClient === "Capg") {
            if (!ectcValid) {
                resultOutput.innerHTML = '<p style="color:red;font-weight:bold;">Please enter a valid ECTC.</p>';
                resultsSection.classList.remove('hidden');
                return;
            }
            if (!experienceValid) {
                resultOutput.innerHTML = '<p style="color:red;font-weight:bold;">Please select a valid Experience range.</p>';
                resultsSection.classList.remove('hidden');
                return;
            }
        }

        const resultRows = clientData[selectedClient].calculate(...values);

// Table wrapper
let resultHTML = `
  <div style="margin-top: 20px;">
    <table style="
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        font-family: 'Segoe UI', sans-serif;
        font-size: 15px;
    ">
      <thead>
        <tr style="background-color: #3f51b5; color: #fff;">
          <th style="text-align: left; padding: 12px 16px;">📍Metric</th>
          <th style="text-align: left; padding: 12px 16px;">💰 Value</th>
        </tr>
      </thead>
      <tbody>
`;

resultRows.forEach((row, index) => {
  const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
  resultHTML += `
    <tr style="background-color: ${bgColor};">
      <td style="padding: 12px 16px; font-weight: 500;">${row.label}</td>
      <td style="padding: 12px 16px; font-weight: bold; color: ${row.color || '#333'};">${row.value}</td>
    </tr>
  `;
});

resultHTML += `
      </tbody>
    </table>
  </div>
`;
resultOutput.innerHTML = resultHTML;
resultsSection.classList.remove('hidden');
    }

    clientDropdown.addEventListener('change', function () {
        const selectedClient = this.value;
	showCapgLegend(selectedClient === "Capg");
        inputFieldsSection.innerHTML = '';
        resultsSection.classList.add('hidden');
        if (!clientData[selectedClient]) return;

        const data = clientData[selectedClient];
        data.labels.forEach((label, index) => {
            const inputGroup = document.createElement('div');
            inputGroup.classList.add('input-group');

            const labelElement = document.createElement('label');
            labelElement.textContent = label + ':';
            inputGroup.appendChild(labelElement);

            if (label === 'Experience' && selectedClient === 'Capg') {
                const select = document.createElement('select');
                select.required = true;
                select.style.padding = '10px 14px';
                select.style.width = '100%';
                select.style.border = '1px solid #aaa';
                select.style.borderRadius = '12px';
                select.style.backgroundColor = '#fff';
                select.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.1)';
                select.style.fontSize = '15px';
                select.style.fontWeight = '500';
                select.style.color = '#333';
                select.style.outline = 'none';
                select.style.transition = 'all 0.2s ease-in-out';
                select.style.cursor = 'pointer';

                select.innerHTML = `
                    <option value="" disabled selected>-- Select Experience --</option>
                    <option value="12 +">12 +</option>
                    <option value="10 to 12">10 to 12</option>
                    <option value="8 to 10">8 to 10</option>
                    <option value="6 to 8">6 to 8</option>
                    <option value="4 to 6">4 to 6</option>`;

                select.addEventListener('change', performCalculation);
                inputGroup.appendChild(select);
                inputFieldsSection.appendChild(inputGroup);
                return;
            }

            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.min = '0';
            input.required = true;
            input.pattern = '[0-9]*';
            input.inputMode = 'decimal';

            // Set default value
            if (Array.isArray(data.defaultValues) && data.defaultValues[index] !== null) {
                input.value = data.defaultValues[index];
            }

            input.addEventListener('keydown', function (e) {
    // Allow navigation keys and shortcuts like Ctrl+V (paste), Ctrl+C (copy), etc.
    if (
        e.ctrlKey || e.metaKey || // Allow Ctrl/Cmd shortcuts
        ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(e.key)
    ) {
        return; // allow default behavior
    }

    // Block non-numeric input
    if (["e", "E", "+", "-"].includes(e.key) || (e.key.length === 1 && isNaN(Number(e.key)) && e.key !== ".")) {
        e.preventDefault();
    }
});
input.addEventListener('paste', function (e) {
    const pasted = e.clipboardData.getData('text');
    if (isNaN(pasted)) {
        e.preventDefault(); // cancel paste if it's not a number
    }
});

            input.addEventListener('input', function () {
                if (parseFloat(input.value) < 0) input.value = '';
                performCalculation();
            });

            const inputWrapper = document.createElement('div');
            inputWrapper.style.display = 'flex';
            inputWrapper.style.alignItems = 'center';

            const unitSpan = document.createElement('span');
            unitSpan.style.marginLeft = '10px';
            unitSpan.style.fontWeight = 'bold';

            if (label.toLowerCase().includes('ectc')) {
                input.dataset.ectc = 'true';
                unitSpan.textContent = getECTCUnit(input.value);
                input.addEventListener('input', function () {
                    unitSpan.textContent = getECTCUnit(this.value);
                    performCalculation();
                });
            }

            inputWrapper.appendChild(input);
            inputWrapper.appendChild(unitSpan);
            inputGroup.appendChild(inputWrapper);
            inputFieldsSection.appendChild(inputGroup);
        });

        // performCalculation(); 
// Trigger calculation after rendering inputs
    });
});
