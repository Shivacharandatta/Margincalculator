document.addEventListener('DOMContentLoaded', function() {
    const clientDropdown = document.getElementById('client-dropdown');
    const inputFieldsSection = document.getElementById('input-fields');
    const resultsSection = document.getElementById('results');
    const resultOutput = document.getElementById('result-output');

    const clientData = {
        "Sony": {
            labels: ["Bill rate(Monthly)", "ECTC(Annually)"],
            calculate: function(billRate, ectc) {
                const margin = (billRate - (billRate * 0.05)) - (ectc / 12);
                return `<p><strong>Margin:</strong> ${margin.toFixed(2)}</p>`;
            }
        },
	"HCL": {
    labels: ["ECTC (Annually)", "Markup %", "Bill Rate Given by Client (Monthly)"],
    calculate: function(ectc, markup, clientBillRate) {
        const billRate = (ectc + (ectc * markup) / 100) / 12;
        const monthlyMargin = billRate - (ectc / 12);
        const annualMargin = monthlyMargin * 12;

        let comparisonMessage = "";
        if (clientBillRate && billRate > clientBillRate) {
            const exceededAmount = billRate - clientBillRate;
            comparisonMessage = `<p style="color:red;"><strong>Warning:</strong> You are exceeding the Bill Rate from client by ₹${exceededAmount.toFixed(2)}</p>`;
        }

        return `
            <p><strong>Billrate (Monthly):</strong> ₹${billRate.toFixed(2)}</p>
            <p><strong>Monthly Margin:</strong> ₹${monthlyMargin.toFixed(2)}</p>
            <p><strong>Annual Margin:</strong> ₹${annualMargin.toFixed(2)}</p>
            ${comparisonMessage}
        `;
    }
},
        "Diageo": {
            labels: ["Bill rate(daily)"],
            calculate: function(billRate) {
                const candidateOffer = (billRate / 1.25) * 227;
		const hourlyrate = billRate / 1.25;
                const margin = (billRate - (billRate / 1.25)) * 18.91667;
                return `<p><strong>Candidate can be offered:</strong> ${candidateOffer.toFixed(2)}</p>
			<p><strong>Candidate daily rate:</strong> ${hourlyrate.toFixed(2)}</p>
                        <p><strong>Margin:</strong> ${margin.toFixed(2)}</p>`;
            }
        },
	"Lowes": {
	    labels: ["Bill rate(Hourly)", "MSP %", "ECTC(Annually)"],
	calculate: function(billRate, msp, ectc) {
	const margin = ((billRate * 160) * (1 - (msp / 100))) - (ectc / 12);
	return `<p><strong>Margin:</strong> ${margin.toFixed(2)}</p>`;
}
},

	"Trane Technologies": {
            labels: ["Bill rate(Hourly)", "ECTC(Annually)"],
            calculate: function(billRate, ectc) {
                const margin = ((billRate*160*12) - (ectc ))/ 12;
                return `<p><strong>Margin:</strong> ${margin.toFixed(2)}</p>`;
            }
        }
    };
function convertECTC(value) {
    value = parseFloat(value);
    if (isNaN(value)) return 0;

    if (value <= 100) return value * 100000;          // Assume LPA
    if (value <= 3500) return value * 160 * 12;       // Hourly
if ( value > 3500 && value < 20000) return value * 20 *12;			// Per day
    return value * 12;                           // Monthly
}

function getECTCUnit(value) {
    value = parseFloat(value);
    if (isNaN(value)) return '';
    if (value <= 100) return 'LPA';
    if (value <= 3500) return 'Hourly';
if (value > 3500 && value < 20000) return 'Per day';
    return 'Monthly';
}
function performCalculation() {
    const selectedClient = clientDropdown.value;
    if (clientData[selectedClient]) {
        const data = clientData[selectedClient];
        const inputs = inputFieldsSection.querySelectorAll('input[type="number"]');
        let values = [];

        inputs.forEach(input => {
            let val = parseFloat(input.value);
            if (input.dataset.ectc === 'true') {
                val = convertECTC(val); // convert ECTC for backend use
            }
            values.push(val);
        });

        if (values.some(isNaN)) {
            resultOutput.innerHTML = '<p class="error">Please enter valid numbers.</p>';
            resultsSection.classList.remove('hidden');
            return;
        }

        let resultHTML = '';
        if (selectedClient === 'Sony') {
            resultHTML = data.calculate(values[0], values[1]);
        } else if (selectedClient === 'Diageo') {
            resultHTML = data.calculate(values[0]);
        } else if (selectedClient === 'Trane Technologies') {
            resultHTML = data.calculate(values[0], values[1]);
        } else if (selectedClient === 'HCL') {
            resultHTML = data.calculate(values[0], values[1], values[2]);
        }else if (selectedClient === 'Lowes') {
                resultHTML = data.calculate(values[0], values[1], values[2]);
            }


        resultOutput.innerHTML = resultHTML;
        resultsSection.classList.remove('hidden');
    } else {
        resultsSection.classList.add('hidden');
    }
}

    clientDropdown.addEventListener('change', function() {
        const selectedClient = this.value;
        inputFieldsSection.innerHTML = ''; // Clear previous input fields
        resultsSection.classList.add('hidden'); // Hide previous results

        if (clientData[selectedClient]) {
            const data = clientData[selectedClient];
            data.labels.forEach((label,index) => {
                const inputGroup = document.createElement('div');
                inputGroup.classList.add('input-group');
                
		const labelElement = document.createElement('label');
                labelElement.textContent = label + ':';
                
		const inputWrapper = document.createElement('div');
            inputWrapper.style.display = 'flex';
            inputWrapper.style.alignItems = 'center';
			
		const inputElement = document.createElement('input');
                inputElement.type = 'number';
                inputElement.step = 'any';
                inputElement.name = label.toLowerCase().replace(/[\s()]/g, ''); // Create a simple name
                inputElement.required = true;
                inputElement.addEventListener('input', performCalculation); // Listen for input changes
                inputGroup.appendChild(labelElement);
                inputGroup.appendChild(inputElement);
                inputFieldsSection.appendChild(inputGroup);
		
		const unitSpan = document.createElement('span');
            unitSpan.style.marginLeft = '10px';
            unitSpan.style.fontWeight = 'bold';
            unitSpan.textContent = '';

            // Track ECTC input for dynamic unit rendering
            if (label.toLowerCase().includes('ectc')) {
                inputElement.dataset.ectc = 'true';
                inputElement.addEventListener('input', function () {
                    unitSpan.textContent = getECTCUnit(this.value);
                    performCalculation();
                });
            } else {
                inputElement.addEventListener('input', performCalculation);
            }

            inputWrapper.appendChild(inputElement);
            inputWrapper.appendChild(unitSpan);
            inputGroup.appendChild(labelElement);
            inputGroup.appendChild(inputWrapper);
            inputFieldsSection.appendChild(inputGroup);
           });
        }
    });
});
