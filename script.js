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
                return <p><strong>📊Margin:</strong> <span style="color:${marginColor};">₹${margin.toFixed(2)}</span></p>;
            }
        },
        "HCL": {
            labels: ["ECTC (Annually)", "Markup %", "Bill Rate Given by Client (Monthly)"],
            defaultValues: [null, 18, null],
            calculate: function (ectc, markup, clientBillRate) {
                const billRate = (ectc + (ectc * markup) / 100) / 12;
                const monthlyMargin = billRate - (ectc / 12);
                const annualMargin = monthlyMargin * 12;
                const monthlyMarginColor = monthlyMargin >= 35000 ? 'green' : 'red';

                let comparisonMessage = "";
                if (clientBillRate && billRate > clientBillRate) {
                    const exceededAmount = billRate - clientBillRate;
                    comparisonMessage = <p style="color:red;"><strong>Warning:</strong> You are exceeding the Bill Rate from client by ₹${exceededAmount.toFixed(2)}</p>;
                }

                return 
                    <p><strong>📉Billrate (Monthly):</strong> ₹${billRate.toFixed(2)}</p>
                    <p><strong>📊Monthly Margin:</strong> <span style="color:${monthlyMarginColor};">₹${monthlyMargin.toFixed(2)}</span></p>
                    <p><strong>📊Annual Margin:</strong> ₹${annualMargin.toFixed(2)}</p>
                    ${comparisonMessage}
                ;
            }
        },
        "Diageo": {
            labels: ["Bill rate(daily)", "Markup %"],
		defaultValues: [null, 25],
            calculate: function (billRate, markUp) {
                const candidateOffer = (billRate / (1 + markUp / 100)) * 227;
                const hourlyrate = billRate / (1 + markUp / 100);
                const margin = (billRate - (billRate / (1 + markUp / 100))) * 18.91667;
                const marginColor = margin >= 35000 ? 'green' : 'red';
                return <p><strong>💼Candidate can be offered:</strong> ₹${candidateOffer.toFixed(2)}</p>
                    <p><strong>💼Candidate daily rate:</strong> ₹${hourlyrate.toFixed(2)}</p>
                    <p><strong>📊Margin:</strong> <span style="color:${marginColor};">₹${margin.toFixed(2)}</span></p>;
            }
        },
        "Lowes": {
            labels: ["Bill rate(Hourly)", "MSP %", "ECTC(Annually)"],
            defaultValues: [null, 3, null],
            calculate: function (billRate, msp, ectc) {
                const margin = ((billRate * 160) * (1 - (msp / 100))) - (ectc / 12);
                const marginColor = margin >= 35000 ? 'green' : 'red';
                return <p><strong>📊Margin:</strong> <span style="color:${marginColor};">₹${margin.toFixed(2)}</span></p>;
            }
        },
	"Infosys": {
		labels: ["Bill rate(daily)", "ECTC"],
		calculate: function (billRate, ectc) {
			const margin = (billRate * 20) - (ectc/12);
			const marginColor = margin >= 35000 ? 'green' : 'red';
			return <p><strong>📊Margin:</strong> <span style="color:${marginColor};">₹${margin.toFixed(2)}</span></p>;
            }
        },

        "Capg": {
            labels: ["ECTC", "Experience"],
            calculate: function (ectc, experience) {
                const dailyrate = (((ectc * 0.1 + ectc)) / 12) / 22;
                const margin = dailyrate * 0.35;
                const billRateWithoutTaxes = dailyrate + margin;
                const billRateWithTaxes = billRateWithoutTaxes * 1.18;
                const marginColor = margin >= 35000 ? 'green' : 'red';

                const limits = {
                    "4 to 6": 6312,
                    "6 to 8": 8490,
                    "8 to 10": 11820,
                    "10 to 12": 14180,
                    "12 +": 16272
                };

                let warning = "";
                if (limits[experience] && billRateWithoutTaxes > limits[experience]) {
                    warning = <p style="color:red;font-weight:bold;">🚫 You can't submit the candidate as you are exceeding the given bill rate</p>;
                }

                return 
                    <p><strong>💼 Bill Rate with Taxes:</strong> ₹${billRateWithTaxes.toFixed(2)}</p>
                    <p><strong>📉 Bill Rate without Taxes:</strong> ₹${billRateWithoutTaxes.toFixed(2)}</p>
                    <p><strong>📊 Margin:</strong> <span style="color:${marginColor}; font-weight: bold;">₹${margin.toFixed(2)}</span></p>
                    ${warning}
                ;
            }
        },
        "Trane Technologies": {
            labels: ["Bill rate(Hourly)", "ECTC(Annually)"],
            calculate: function (billRate, ectc) {
                const margin = ((billRate * 160 * 12) - (ectc)) / 12;
                const marginColor = margin >= 35000 ? 'green' : 'red';
                return <p><strong>📊Margin:</strong> <span style="color:${marginColor};">₹${margin.toFixed(2)}</span></p>;
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

    legendContainer.innerHTML = 
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
        <td style="border:1px solid #ccc;padding:8px;">12 LPA</td>
    </tr>
</tbody>
        </table>
    ;
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

        const resultHTML = clientData[selectedClient].calculate(...values);
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

                select.innerHTML = 
                    <option value="" disabled selected>-- Select Experience --</option>
                    <option value="12 +">12 +</option>
                    <option value="10 to 12">10 to 12</option>
                    <option value="8 to 10">8 to 10</option>
                    <option value="6 to 8">6 to 8</option>
                    <option value="4 to 6">4 to 6</option>;

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
                if (["e", "E", "+", "-"].includes(e.key) || (e.key.length === 1 && isNaN(Number(e.key)) && e.key !== ".")) {
                    e.preventDefault();
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
