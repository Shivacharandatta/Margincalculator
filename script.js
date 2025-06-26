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
		const marginColor = margin >= 35000 ? 'green' : 'red';
                return <p><strong>Margin:</strong> <span style="color:${marginColor};">₹${margin.toFixed(2)}</span></p>;
            }
        },
	"HCL": {
    labels: ["ECTC (Annually)", "Markup %", "Bill Rate Given by Client (Monthly)"],
	defaultValues: [null, 18, null],
    calculate: function(ectc, markup, clientBillRate) {
        const billRate = (ectc + (ectc * markup) / 100) / 12;
        const monthlyMargin = billRate - (ectc / 12);
        const annualMargin = monthlyMargin * 12;
	const bufferAmount = clientBillRate - billRate

let bufferMessage = '';        
let comparisonMessage = "";
const monthlyMarginColor = monthlyMargin >= 35000 ? 'green' : 'red';
  if (clientBillRate && clientBillRate > billRate) {
    const bufferAmount = clientBillRate - billRate;
    bufferMessage = <p style="color:green;"><strong>Buffer Amount (Monthly):</strong> ₹${bufferAmount.toFixed(2)}</p>;
  }else if (clientBillRate && billRate > clientBillRate) {
            const exceededAmount = billRate - clientBillRate;
            comparisonMessage = <p style="color:red;"><strong>Warning:</strong> You are exceeding the Bill Rate from client by ₹${exceededAmount.toFixed(2)}</p>;
        }

        return 
            <p><strong>Billrate (Monthly):</strong> ₹${billRate.toFixed(2)}</p>
            <p><strong>Monthly Margin:</strong> <span style="color:${monthlyMarginColor};">₹${monthlyMargin.toFixed(2)}</span></p>
            <p><strong>Annual Margin:</strong> ₹${annualMargin.toFixed(2)}</p>
	    ${bufferMessage}
            ${comparisonMessage}
        ;
    }
},
        "Diageo": {
            labels: ["Bill rate(daily)", "Markup %",],
            calculate: function(billRate, markUp) {
                const candidateOffer = (billRate / (1+markUp/100)) * 227;
		const hourlyrate = billRate / (1+markUp/100);
                const margin = (billRate - (billRate / (1+markUp/100))) * 18.91667;
		const marginColor = margin >= 35000 ? 'green' : 'red';

                return <p><strong>Candidate can be offered:</strong> ₹${candidateOffer.toFixed(2)}</p>
			<p><strong>Candidate daily rate:</strong> ₹${hourlyrate.toFixed(2)}</p>
                        <p><strong>Margin:</strong> <span style="color:${marginColor};">₹${margin.toFixed(2)}</span></p>;
            }
        },
	"Lowes": {
	    labels: ["Bill rate(Hourly)", "MSP %", "ECTC(Annually)"],
	defaultValues: [null, 3, null],
	calculate: function(billRate, msp, ectc) {
	const margin = ((billRate * 160) * (1 - (msp / 100))) - (ectc / 12);
	const marginColor = margin >= 35000 ? 'green' : 'red';
	return <p><strong>Margin:</strong> <span style="color:${marginColor};">₹${margin.toFixed(2)}</span></p>;
}
},
	    "Capgemini": {
    labels: ["ECTC", "Experience"],
    calculate: function(ectc, experience) {
        const dailyrate = (((ectc*0.1+ectc))/12)/22;
        const margin = dailyrate*0.35*22;
        const billRateWithoutTaxes =  dailyrate + margin;
	const billRateWithTaxes = billRateWithoutTaxes * 0.18 + billRateWithoutTaxes;
	const marginColor = margin >= 35000 ? 'green' : 'red';

        let warning = "";
        const limits = {
            "4 to 6": 6312,
            "6 to 8": 8490,
            "8 to 10": 11820,
            "10 to 12": 14180,
            "12 +": 16272
        };

        if (limits[experience] && billRateWithoutTaxes > limits[experience]) {
            warning = <p style="color:red;"><strong>You can't submit the candidate as you are exceeding the given bill rate</strong></p>;
        }

        return 
            <p><strong>Bill Rate with Taxes:</strong> ₹${billRateWithTaxes.toFixed(2)}</p>
            <p><strong>Bill Rate without Taxes:</strong> ₹${billRateWithoutTaxes.toFixed(2)}</p>
            <p><strong>Margin:</strong> ₹${margin.toFixed(2)}</p>
            ${warning}
        ;
    }
},

	"Trane Technologies": {
            labels: ["Bill rate(Hourly)", "ECTC(Annually)"],
            calculate: function(billRate, ectc) {
                const margin = ((billRate*160*12) - (ectc ))/ 12;
		const marginColor = margin >= 35000 ? 'green' : 'red';
                return <p><strong>Margin:</strong> <span style="color:${marginColor};">₹${margin.toFixed(2)}</span></p>;
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
            resultHTML = data.calculate(values[0], values[1]);
        } else if (selectedClient === 'Trane Technologies') {
            resultHTML = data.calculate(values[0], values[1]);
        } else if (selectedClient === 'HCL') {
            resultHTML = data.calculate(values[0], values[1], values[2]);
        }else if (selectedClient === 'Capgemini') {
    resultHTML = data.calculate(values[0], values[1]); // ECTC, Experience
}
	else if (selectedClient === 'Lowes') {
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
		inputElement.min = '0';
		inputElement.pattern = '[0-9]*'; // Hint for numeric input on mobile
		inputElement.inputMode = 'decimal'; //  Optimizes input keyboard for mobile
                inputElement.name = label.toLowerCase().replace(/[\s()]/g, ''); // Create a simple name
                inputElement.required = true;
                inputElement.addEventListener('input', performCalculation); // Listen for input changes
// Prevent non-numeric and negative input while typing
inputElement.addEventListener('keydown', function (e) {
    // Block "-", "+", "e", "E", any letters
    if (
        ["e", "E", "+", "-"].includes(e.key) ||
        (e.key.length === 1 && isNaN(Number(e.key)) && e.key !== ".")
    ) {
        e.preventDefault();
    }
});

// Also ensure value is never negative manually
inputElement.addEventListener('input', function () {
    if (parseFloat(inputElement.value) < 0) {
        inputElement.value = '';
    }
    performCalculation();
});
                inputGroup.appendChild(labelElement);
                inputGroup.appendChild(inputElement);
                inputFieldsSection.appendChild(inputGroup);

		if (data.defaultValues && data.defaultValues[index] !== null) {
  inputElement.value = data.defaultValues[index];
}
		
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
