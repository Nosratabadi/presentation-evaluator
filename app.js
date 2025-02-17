const scriptURL = 'https://script.google.com/macros/s/AKfycbxrEpYMHODlmG1aZStirM2RYk7_p9MPKQR1er0LQALoF-es06c39hVZ2IuDksfGannwmg/exec'; // Replace with your actual Web App URL

document.addEventListener('DOMContentLoaded', () => {
    const addPresenterForm = document.getElementById('add-presenter-form');
    const addPresenterButton = document.getElementById('add-presenter-button');
    const newPresenterNameInput = document.getElementById('new-presenter-name');

    const presenterListDiv = document.getElementById('presenter-list');
    const presenterList = document.getElementById('presenter-list-ul');

    const evaluationForm = document.getElementById('evaluation-form');
    const presenterSelect = document.getElementById('presenter-select');
    const evaluatorNameInput = document.getElementById('evaluator-name');
    const materialQualityInput = document.getElementById('material-quality');
    const knowledgeDepthInput = document.getElementById('knowledge-depth');
    const presentationStyleInput = document.getElementById('presentation-style');
    const topicAttractivenessInput = document.getElementById('topic-attractiveness');
    const submitEvaluationButton = document.getElementById('submit-evaluation-button');

    const presenterListContainer = document.getElementById('presenter-list-container');

    const evaluationHistoryModal = document.getElementById('evaluation-history-modal');
    const evaluationHistoryContent = document.getElementById('evaluation-history-content');
    const closeModalButton = document.getElementById('close-modal-button');

    let currentPresenterName = null; // Track the presenter being evaluated

    // Function to fetch and display presenters
    async function loadPresenters() {
        try {
            const response = await fetch(`${scriptURL}?func=getPresenters`);
            const data = await response.json();

            if (data.result === 'success') {
                presenterList.innerHTML = '';  //Clear the list
                presenterSelect.innerHTML = '';

                data.presenters.forEach(presenter => {
                    // Create list item for each presenter
                    const listItem = document.createElement('li');
                    listItem.classList.add('mb-2', 'p-4', 'bg-white', 'rounded', 'shadow', 'cursor-pointer');
                    listItem.textContent = presenter.name;
                    listItem.addEventListener('click', () => showEvaluationPage(presenter.name));
                    presenterList.appendChild(listItem);

                    // Add presenter to dropdown in evaluation form
                    const option = document.createElement('option');
                    option.value = presenter.name;
                    option.textContent = presenter.name;
                    presenterSelect.appendChild(option);

                });

                showPresenterList();

            } else {
                alert('Error loading presenters: ' + data.error);
            }
        } catch (error) {
            console.error('Error loading presenters:', error);
            alert('Error loading presenters.');
        }
    }

    function showPresenterList() {
        addPresenterForm.style.display = 'block'; // Show add presenter form
        presenterListDiv.style.display = 'block'; // Show list
        evaluationForm.style.display = 'none'; // Hide form
    }

    function showEvaluationPage(presenterName) {
        currentPresenterName = presenterName;
        document.getElementById('evaluation-title').textContent = `Evaluate ${presenterName}`;
        presenterListDiv.style.display = 'none'; // Hide list
        addPresenterForm.style.display = 'none'; // Hide add presenter form
        evaluationForm.style.display = 'block'; // Show evaluation form
        // Set selected presenter in evaluation form
        presenterSelect.value = presenterName;
    }

    // Function to add a new presenter
    addPresenterButton.addEventListener('click', async () => {
        const presenterName = newPresenterNameInput.value.trim();
        if (!presenterName) {
            alert('Please enter a presenter name.');
            return;
        }

        const url = `${scriptURL}?func=addPresenter&presenterName=${presenterName}`;  // Store URL in a variable
        console.log("Fetch URL:", url);  // Log the URL

        try {
            const response = await fetch(url); // Use the variable
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
        const presenterName = currentPresenterName;  // Use currently selected presenter
        const evaluatorName = evaluatorNameInput.value.trim();
        const materialQuality = parseInt(materialQualityInput.value);
        const knowledgeDepth = parseInt(knowledgeDepthInput.value);
        const presentationStyle = parseInt(presentationStyleInput.value);
        const topicAttractiveness = parseInt(topicAttractivenessInput.value);

        if (!evaluatorName) {
            alert("Please enter your name.");
            return;
        }

        if (isNaN(materialQuality) || materialQuality < 0 || materialQuality > 10 ||
            isNaN(knowledgeDepth) || knowledgeDepth < 0 || knowledgeDepth > 10 ||
            isNaN(presentationStyle) || presentationStyle < 0 || presentationStyle > 10 ||
            isNaN(topicAttractiveness) || topicAttractiveness < 0 || topicAttractiveness > 10) {
            alert('Scores must be numbers between 0 and 10.');
            return;
        }

        try {
            const params = new URLSearchParams();
            params.append('func', 'submitEvaluation');
            params.append('presenterName', presenterName);
            params.append('evaluatorName', evaluatorName);
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

                showPresenterList(); // Go back to presenter list
                alert('Evaluation submitted successfully!');
            } else {
                alert('Error submitting evaluation: ' + data.error);
            }
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            alert('Error submitting evaluation.');
        }
    });

    // Input Validation
    materialQualityInput.addEventListener('input', validateScore);
    knowledgeDepthInput.addEventListener('input', validateScore);
    presentationStyleInput.addEventListener('input', validateScore);
    topicAttractivenessInput.addEventListener('input', validateScore);

    function validateScore(event) {
        const input = event.target;
        let value = parseInt(input.value);
        if (isNaN(value)) {
            input.value = ''; // Clear if not a number
        } else if (value < 0) {
            input.value = '0';
        } else if (value > 10) {
            input.value = '10';
        }
    }

    // Load presenters on page load
    loadPresenters();
});
