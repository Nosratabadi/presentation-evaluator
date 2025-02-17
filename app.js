const scriptURL = 'https://script.google.com/macros/s/AKfycbxrEpYMHODlmG1aZStirM2RYk7_p9MPKQR1er0LQALoF-es06c39hVZ2IuDksfGannwmg/exec'; // Replace with your actual Web App URL

document.addEventListener('DOMContentLoaded', () => {
    const addPresenterForm = document.getElementById('add-presenter-form');
    const addPresenterButton = document.getElementById('add-presenter-button');
    const newPresenterNameInput = document.getElementById('new-presenter-name');

    const evaluationForm = document.getElementById('evaluation-form');
    const presenterSelect = document.getElementById('presenter-select');
    const evaluatorNameInput = document.getElementById('evaluator-name');
    const materialQualityInput = document.getElementById('material-quality');
    const knowledgeDepthInput = document.getElementById('knowledge-depth');
    const presentationStyleInput = document.getElementById('presentation-style');
    const topicAttractivenessInput = document.getElementById('topic-attractiveness');
    const submitEvaluationButton = document.getElementById('submit-evaluation-button');

    const presenterList = document.getElementById('presenter-list');
    const presenterTableBody = document.getElementById('presenter-table-body');

    const evaluationHistoryModal = document.getElementById('evaluation-history-modal');
    const evaluationHistoryContent = document.getElementById('evaluation-history-content');
    const closeModalButton = document.getElementById('close-modal-button');

    // Function to fetch and display presenters
    async function loadPresenters() {
        try {
            const response = await fetch(`${scriptURL}?func=getPresenters`);
            const data = await response.json();

            if (data.result === 'success') {
                presenterSelect.innerHTML = ''; // Clear existing options
                presenterTableBody.innerHTML = '';  //Clear the table body

                data.presenters.forEach(presenter => {
                    // Add option to select
                    const option = document.createElement('option');
                    option.value = presenter.name;
                    option.textContent = presenter.name;
                    presenterSelect.appendChild(option);


                    //Add presenter to table
                    const row = presenterTableBody.insertRow();
                    const nameCell = row.insertCell();
                    const materialQualityCell = row.insertCell();
                    const knowledgeDepthCell = row.insertCell();
                    const presentationStyleCell = row.insertCell();
                    const topicAttractivenessCell = row.insertCell();
                    const historyCell = row.insertCell();

                    nameCell.textContent = presenter.name;

                    //Create progress bar
                    materialQualityCell.innerHTML = createProgressBar(presenter.materialQualityAvg);
                    knowledgeDepthCell.innerHTML = createProgressBar(presenter.knowledgeDepthAvg);
                    presentationStyleCell.innerHTML = createProgressBar(presenter.presentationStyleAvg);
                    topicAttractivenessCell.innerHTML = createProgressBar(presenter.topicAttractivenessAvg);

                    const historyButton = document.createElement('button');
                    historyButton.textContent = 'View History';
                    historyButton.classList.add('bg-purple-500', 'hover:bg-purple-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded');
                    historyButton.addEventListener('click', () => showEvaluationHistory(presenter.name));
                    historyCell.appendChild(historyButton);

                });
            } else {
                alert('Error loading presenters: ' + data.error);
            }
        } catch (error) {
            console.error('Error loading presenters:', error);
            alert('Error loading presenters.');
        }
    }


    //Helper function to create progress bars
    function createProgressBar(value) {
        const percentage = (value / 10) * 100;  //Assuming max score is 10
        return `
            <div class="progress-bar">
                <div class="progress-bar-inner" style="width: ${percentage}%;"></div>
                <span>${value ? value.toFixed(2) : 0}</span>
            </div>
        `;
    }


    //Function to show evaluation history
    async function showEvaluationHistory(presenterName) {
        try {
            const response = await fetch(`${scriptURL}?func=getEvaluationsForPresenter&presenterName=${presenterName}`);
            const data = await response.json();

            if (data.result === 'success') {
                evaluationHistoryContent.innerHTML = ''; //Clear previous content

                if (data.evaluations.length === 0) {
                    evaluationHistoryContent.textContent = 'No evaluations yet for this presenter.';
                } else {
                    const ul = document.createElement('ul');
                    data.evaluations.forEach(evaluation => {
                        const li = document.createElement('li');
                        li.textContent = `Evaluator: ${evaluation.evaluatorName}, Material: ${evaluation.materialQuality}, Knowledge: ${evaluation.knowledgeDepth}, Style: ${evaluation.presentationStyle}, Topic: ${evaluation.topicAttractiveness}, Timestamp: ${new Date(evaluation.timestamp).toLocaleString()}`;
                        ul.appendChild(li);
                    });
                    evaluationHistoryContent.appendChild(ul);
                }


                evaluationHistoryModal.classList.remove('hidden');  //Show the modal
            } else {
                alert('Error loading evaluation history: ' + data.error);
            }

        } catch (error) {
            console.error('Error loading evaluation history', error);
            alert('Error loading evaluation history.');
        }
    }

    //Event listener for closing the modal
    closeModalButton.addEventListener('click', () => {
        evaluationHistoryModal.classList.add('hidden');
    });


    // Function to add a new presenter
    addPresenterButton.addEventListener('click', async () => {
        const presenterName = newPresenterNameInput.value.trim();
        if (!presenterName) {
            alert('Please enter a presenter name.');
            return;
        }

        try {
            const response = await fetch(`${scriptURL}?func=addPresenter&presenterName=${presenterName}`);
            const data = await response.json();

            if (data.result === 'success') {
                newPresenterNameInput.value = ''; // Clear the input
                loadPresenters(); // Reload the presenter list
            } else {
                alert('Error adding presenter: ' + data.error);
            }
        } catch (error) {
            console.error('Error adding presenter:', error);
            alert('Error adding presenter.');
        }
    });

    // Function to submit an evaluation
    submitEvaluationButton.addEventListener('click', async () => {
        const presenterName = presenterSelect.value;
        const evaluatorName = evaluatorNameInput.value.trim();  //Added evaluator name
        const materialQuality = materialQualityInput.value;
        const knowledgeDepth = knowledgeDepthInput.value;
        const presentationStyle = presentationStyleInput.value;
        const topicAttractiveness = topicAttractivenessInput.value;

        if (!evaluatorName) {
            alert("Please enter your name.");
            return;
        }

        if (!presenterName || !materialQuality || !knowledgeDepth || !presentationStyle || !topicAttractiveness) {
            alert('Please fill out all evaluation fields.');
            return;
        }

        try {
            const params = new URLSearchParams();
            params.append('func', 'submitEvaluation');
            params.append('presenterName', presenterName);
            params.append('evaluatorName', evaluatorName); //Added evaluator name
            params.append('materialQuality', materialQuality);
            params.append('knowledgeDepth', knowledgeDepth);
            params.append('presentationStyle', presentationStyle);
            params.append('topicAttractiveness', topicAttractiveness);

            const response = await fetch(scriptURL + '?' + params.toString());
            const data = await response.json();

            if (data.result === 'success') {
                //Clear form
                evaluatorNameInput.value = '';
                materialQualityInput.value = '';
                knowledgeDepthInput.value = '';
                presentationStyleInput.value = '';
                topicAttractivenessInput.value = '';

                loadPresenters(); // Reload the presenter list
                alert('Evaluation submitted successfully!');
            } else {
                alert('Error submitting evaluation: ' + data.error);
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            alert('Error submitting evaluation.');
        }
    });

    // Load presenters on page load
    loadPresenters();
});
