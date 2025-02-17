const { useState, useEffect } = React;

// Main App Component
const App = () => {
    const [presenters, setPresenters] = useState(() => {
        const saved = localStorage.getItem('presenters');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentView, setCurrentView] = useState('list');
    const [currentPresenter, setCurrentPresenter] = useState(null);
    const [newPresenterName, setNewPresenterName] = useState('');

    useEffect(() => {
        localStorage.setItem('presenters', JSON.stringify(presenters));
    }, [presenters]);

    const criteria = [
        'Material Quality',
        'Knowledge Depth',
        'Presentation Style',
        'Topic Attractiveness'
    ];

    const updatePresenterEvaluation = (presenterId, evaluation) => {
        setPresenters(prevPresenters => 
            prevPresenters.map(p => 
                p.id === presenterId
                    ? { ...p, evaluations: [...p.evaluations, evaluation] }
                    : p
            )
        );
    };

    return React.createElement('div', { className: 'min-h-screen bg-gray-100 p-8' },
        currentView === 'list' 
            ? React.createElement(PresenterList, {
                presenters,
                newPresenterName,
                setNewPresenterName,
                addPresenter: (e) => {
                    e.preventDefault();
                    if (newPresenterName.trim()) {
                        const newPresenter = {
                            id: Date.now(),
                            name: newPresenterName,
                            evaluations: []
                        };
                        setPresenters([...presenters, newPresenter]);
                        setNewPresenterName('');
                    }
                },
                onPresenterClick: (presenter) => {
                    setCurrentPresenter(presenter);
                    setCurrentView('evaluate');
                }
            })
            : React.createElement(EvaluationView, {
                presenter: currentPresenter,
                criteria,
                onBack: () => setCurrentView('list'),
                onNewEvaluation: (evaluation) => {
                    updatePresenterEvaluation(currentPresenter.id, evaluation);
                }
            })
    );
};

// Presenter List Component remains the same...

// Modified Evaluation View Component
const EvaluationView = ({ presenter, criteria, onBack, onNewEvaluation }) => {
    const [scores, setScores] = useState({});
    const [error, setError] = useState('');
    const [evaluatorName, setEvaluatorName] = useState('');
    const [evaluations, setEvaluations] = useState(presenter.evaluations);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!evaluatorName.trim()) {
            setError('Please enter your name');
            return;
        }

        // Check if this evaluator has already submitted
        const hasSubmitted = evaluations.some(eval => eval.evaluatorName === evaluatorName);
        if (hasSubmitted) {
            setError('You have already submitted an evaluation');
            return;
        }

        if (Object.keys(scores).length !== criteria.length) {
            setError('Please provide scores for all criteria');
            return;
        }

        const evaluation = {
            id: Date.now(),
            evaluatorName,
            scores,
            timestamp: new Date().toISOString()
        };

        // Update local state immediately
        setEvaluations(prev => [...prev, evaluation]);
        onNewEvaluation(evaluation);
        
        // Reset form
        setScores({});
        setEvaluatorName('');
        setError('');
    };

    return React.createElement('div', { className: 'max-w-4xl mx-auto' },
        React.createElement('button', {
            onClick: onBack,
            className: 'mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800'
        }, '← Back to List'),

        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow-sm' },
            React.createElement('h2', { className: 'text-2xl font-bold mb-6' }, `Evaluate: ${presenter.name}`),

            React.createElement('div', { className: 'mb-8' },
                React.createElement('h3', { className: 'text-xl font-semibold mb-4' }, 'Previous Evaluations'),
                React.createElement('table', { className: 'w-full' },
                    React.createElement('thead', null,
                        React.createElement('tr', null,
                            React.createElement('th', { className: 'px-4 py-2 text-left' }, '#'),
                            React.createElement('th', { className: 'px-4 py-2 text-left' }, 'Evaluator'),
                            ...criteria.map(criterion =>
                                React.createElement('th', { 
                                    key: criterion,
                                    className: 'px-4 py-2 text-left'
                                }, criterion)
                            ),
                            React.createElement('th', { className: 'px-4 py-2 text-left' }, 'Total')
                        )
                    ),
                    React.createElement('tbody', null,
                        evaluations.map((eval, index) => {
                            const total = Object.values(eval.scores).reduce((a, b) => a + b, 0);
                            return React.createElement('tr', { key: eval.id },
                                React.createElement('td', { className: 'border px-4 py-2' }, index + 1),
                                React.createElement('td', { className: 'border px-4 py-2' }, eval.evaluatorName),
                                ...criteria.map(criterion =>
                                    React.createElement('td', { 
                                        key: criterion,
                                        className: 'border px-4 py-2'
                                    }, eval.scores[criterion])
                                ),
                                React.createElement('td', { className: 'border px-4 py-2 font-semibold' }, total)
                            );
                        })
                    )
                )
            ),

            React.createElement('form', { 
                onSubmit: handleSubmit,
                className: 'space-y-4'
            },
                React.createElement('h3', { className: 'text-xl font-semibold' }, 'New Evaluation'),
                React.createElement('div', { className: 'mb-4' },
                    React.createElement('label', { className: 'mb-1 block' }, 'Your Name'),
                    React.createElement('input', {
                        type: 'text',
                        value: evaluatorName,
                        onChange: (e) => setEvaluatorName(e.target.value),
                        className: 'p-2 border rounded w-full',
                        placeholder: 'Enter your name'
                    })
                ),
                React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
                    criteria.map(criterion =>
                        React.createElement('div', { key: criterion, className: 'flex flex-col' },
                            React.createElement('label', { className: 'mb-1' }, criterion),
                            React.createElement('input', {
                                type: 'number',
                                min: '0',
                                max: '10',
                                value: scores[criterion] || '',
                                onChange: (e) => {
                                    const score = parseInt(e.target.value);
                                    if (isNaN(score) || score < 0 || score > 10) return;
                                    setScores(prev => ({ ...prev, [criterion]: score }));
                                    setError('');
                                },
                                className: 'p-2 border rounded',
                                placeholder: '0-10'
                            })
                        )
                    )
                ),
                error && React.createElement('p', { className: 'text-red-500' }, error),
                React.createElement('button', {
                    type: 'submit',
                    className: 'bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600'
                }, 'Submit Evaluation')
            )
        )
    );
};

// Render the app
ReactDOM.render(
    React.createElement(App),
    document.getElementById('root')
);
