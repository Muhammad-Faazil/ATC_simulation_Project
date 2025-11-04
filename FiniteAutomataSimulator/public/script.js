document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const statesInput = document.getElementById('states');
    const alphabetInput = document.getElementById('alphabet');
    const startStateInput = document.getElementById('start-state');
    const acceptStatesInput = document.getElementById('accept-states');
    const transitionsInput = document.getElementById('transitions');
    const inputStringInput = document.getElementById('input-string');
    const simulateButton = document.getElementById('simulate-button');
    const stepPrevButton = document.getElementById('step-prev');
    const stepNextButton = document.getElementById('step-next');
    const resultDiv = document.getElementById('result');
    const visualizationDiv = document.getElementById('visualization');
    const errorDisplay = document.getElementById('error-display');
    const simulationStepsDiv = document.getElementById('simulation-steps');
    const stepsContent = document.getElementById('steps-content');
    const sampleAutomataSelect = document.getElementById('sample-automata');
    const exportButton = document.getElementById('export-btn');
    const importButton = document.getElementById('import-btn');
    const importFileInput = document.getElementById('import-file');

    let network = null;
    let currentSimulation = null;
    let currentStep = 0;

    // Sample automata definitions
    const sampleAutomata = {
        dfa_ends_with_1: {
            name: "DFA - Ends with 1",
            states: "q0,q1",
            alphabet: "0,1",
            startState: "q0",
            acceptStates: "q1",
            transitions: "q0,0=q0\nq0,1=q1\nq1,0=q0\nq1,1=q1"
        },
        dfa_even_zeros: {
            name: "DFA - Even number of 0s",
            states: "q0,q1",
            alphabet: "0,1",
            startState: "q0",
            acceptStates: "q0",
            transitions: "q0,0=q1\nq0,1=q0\nq1,0=q0\nq1,1=q1"
        },
        nfa_contains_01: {
            name: "NFA - Contains '01'",
            states: "q0,q1,q2",
            alphabet: "0,1",
            startState: "q0",
            acceptStates: "q2",
            transitions: "q0,0=q0\nq0,0=q1\nq0,1=q0\nq1,1=q2\nq2,0=q2\nq2,1=q2"
        },
        nfa_epsilon: {
            name: "NFA with Epsilon",
            states: "q0,q1,q2",
            alphabet: "a,b",
            startState: "q0",
            acceptStates: "q2",
            transitions: "q0,e=q1\nq0,e=q2\nq1,a=q1\nq1,b=q2\nq2,a=q2"
        },
        dfa_starts_with_1: {
            name: "DFA - Starts with 1",
            states: "q0,q1,q2",
            alphabet: "0,1",
            startState: "q0",
            acceptStates: "q1",
            transitions: "q0,0=q2\nq0,1=q1\nq1,0=q1\nq1,1=q1\nq2,0=q2\nq2,1=q2"
        },
        dfa_binary_divisible_by_3: {
            name: "DFA - Binary Number Divisible by 3",
            states: "q0,q1,q2",
            alphabet: "0,1",
            startState: "q0",
            acceptStates: "q0",
            transitions: 
                "q0,0=q0\nq0,1=q1\nq1,0=q2\nq1,1=q0\nq2,0=q1\nq2,1=q2"
        },

        nfa_ends_with_ab: {
            name: "NFA - Ends with 'ab'",
            states: "q0,q1,q2",
            alphabet: "a,b",
            startState: "q0",
            acceptStates: "q2",
            transitions: 
                "q0,a=q0\nq0,b=q0\nq0,a=q1\nq1,b=q2"
        },

        nfa_contains_abc: {
            name: "NFA - Contains 'abc'",
            states: "q0,q1,q2,q3",
            alphabet: "a,b,c",
            startState: "q0",
            acceptStates: "q3",
            transitions: 
                "q0,a=q1\nq1,b=q2\nq2,c=q3\nq0,b=q0\nq0,c=q0\nq1,a=q1\nq2,a=q0"
        },

        nfa_epsilon_loop: {
            name: "NFA with Epsilon Loop",
            states: "q0,q1,q2",
            alphabet: "0,1",
            startState: "q0",
            acceptStates: "q2",
            transitions: 
                "q0,e=q1\nq1,e=q2\nq2,e=q0\nq1,1=q1\nq2,0=q2"
        },

        dfa_vowel_checker: {
            name: "DFA - String contains at least one vowel",
            states: "q0,q1",
            alphabet: "a,e,i,o,u,b,c,d",
            startState: "q0",
            acceptStates: "q1",
            transitions:
                "q0,a=q1\nq0,e=q1\nq0,i=q1\nq0,o=q1\nq0,u=q1\nq0,b=q0\nq0,c=q0\nq0,d=q0\nq1,a=q1\nq1,e=q1\nq1,i=q1\nq1,o=q1\nq1,u=q1\nq1,b=q1\nq1,c=q1\nq1,d=q1"
        }
    };

    // Initialize sample automata selector
    sampleAutomataSelect.addEventListener('change', (e) => {
        const selected = sampleAutomata[e.target.value];
        if (selected) {
            statesInput.value = selected.states;
            alphabetInput.value = selected.alphabet;
            startStateInput.value = selected.startState;
            acceptStatesInput.value = selected.acceptStates;
            transitionsInput.value = selected.transitions;
            simulate();
        }
    });

    // Export functionality
    exportButton.addEventListener('click', () => {
        const automaton = {
            name: "Custom Automaton",
            states: statesInput.value,
            alphabet: alphabetInput.value,
            startState: startStateInput.value,
            acceptStates: acceptStatesInput.value,
            transitions: transitionsInput.value
        };
        
        const dataStr = JSON.stringify(automaton, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'automaton.json';
        link.click();
        URL.revokeObjectURL(url);
    });

    // Import functionality
    importButton.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const automaton = JSON.parse(event.target.result);
                    statesInput.value = automaton.states;
                    alphabetInput.value = automaton.alphabet;
                    startStateInput.value = automaton.startState;
                    acceptStatesInput.value = automaton.acceptStates;
                    transitionsInput.value = automaton.transitions;
                    simulate();
                    showError('');
                } catch (error) {
                    showError('Invalid automaton file format');
                }
            };
            reader.readAsText(file);
        }
    });

    function showError(message) {
        if (message) {
            errorDisplay.textContent = message;
            errorDisplay.classList.remove('hidden');
        } else {
            errorDisplay.classList.add('hidden');
        }
    }

    function validateAutomaton(states, alphabet, startState, acceptStates, transitions) {
        const errors = [];

        // Check if states are defined
        if (states.length === 0) {
            errors.push('States cannot be empty');
        }

        // Check if alphabet is defined
        if (alphabet.length === 0) {
            errors.push('Alphabet cannot be empty');
        }

        // Check if start state is defined and exists in states
        if (!startState) {
            errors.push('Start state cannot be empty');
        } else if (!states.includes(startState)) {
            errors.push(`Start state '${startState}' is not in the list of states`);
        }

        // Check if accept states exist in states
        for (const acceptState of acceptStates) {
            if (!states.includes(acceptState)) {
                errors.push(`Accept state '${acceptState}' is not in the list of states`);
            }
        }

        // Check transitions
        for (const fromState in transitions) {
            if (!states.includes(fromState)) {
                errors.push(`Transition from unknown state '${fromState}'`);
            }
            for (const symbol in transitions[fromState]) {
                if (symbol !== 'e' && !alphabet.includes(symbol)) {
                    errors.push(`Transition symbol '${symbol}' is not in the alphabet`);
                }
                for (const toState of transitions[fromState][symbol]) {
                    if (!states.includes(toState)) {
                        errors.push(`Transition to unknown state '${toState}'`);
                    }
                }
            }
        }

        return errors;
    }

    function visualizeAutomaton(states, transitions, startState, acceptStates, currentStates = null) {
        const nodes = new vis.DataSet();
        const edges = new vis.DataSet();

        // Track edge counts for curved transitions
        const edgeCounts = {};

        // Create nodes for each state
        states.forEach(state => {
            let color = '#dcedc1'; // Default color
            let shape = 'circle';
            let borderWidth = 1;
            let borderColor = '#2c3e50';
            
            // Check if it's the start state
            const isStartState = startState === state;
            
            // Check if it's an accept state
            const isAcceptState = acceptStates.includes(state);
            
            // Check if it's currently active
            const isActive = currentStates && currentStates.has(state);
            
            // Set colors and styles based on state properties
            if (isStartState) {
                color = '#cce5ff'; // Start state color
            }
            if (isAcceptState) {
                color = '#99e79dff'; // Accept state color
                borderWidth = 4; // Thicker border for accept states
            }
            if (isActive) {
                borderWidth = Math.max(borderWidth, 4);
                borderColor = '#e74c3c';
            }

            // For accept states, create double circle effect using shape properties
            if (isAcceptState) {
                nodes.add({
                    id: state,
                    label: state,
                    color: {
                        background: color,
                        border: borderColor,
                        highlight: {
                            background: color,
                            border: borderColor
                        }
                    },
                    shape: 'circle',
                    borderWidth: borderWidth,
                    font: { 
                        size: 16,
                        color: '#2c3e50',
                        face: 'Arial',
                        strokeWidth: 1,
                        strokeColor: 'white'
                    },
                    // Double circle effect using shadow
                    shadow: {
                        enabled: true,
                        color: borderColor,
                        size: 10,
                        x: 0,
                        y: 0
                    }
                });
            } else {
                nodes.add({
                    id: state,
                    label: state,
                    color: {
                        background: color,
                        border: borderColor,
                        highlight: {
                            background: color,
                            border: borderColor
                        }
                    },
                    shape: shape,
                    borderWidth: borderWidth,
                    font: { 
                        size: 16,
                        color: '#2c3e50',
                        face: 'Arial',
                        strokeWidth: 1,
                        strokeColor: 'white'
                    }
                });
            }
        });

        // Add transitions as edges with proper curvature
        for (const fromState in transitions) {
            for (const symbol in transitions[fromState]) {
                const toStates = transitions[fromState][symbol];
                toStates.forEach(toState => {
                    const edgeKey = `${fromState}-${toState}-${symbol}`;
                    const reverseEdgeKey = `${toState}-${fromState}-${symbol}`;
                    
                    // Check if this transition is currently active
                    const isActive = currentStates && currentStates.has(fromState);
                    
                    // Count edges between same nodes for curvature
                    if (!edgeCounts[edgeKey]) {
                        edgeCounts[edgeKey] = 0;
                    }
                    if (!edgeCounts[reverseEdgeKey]) {
                        edgeCounts[reverseEdgeKey] = 0;
                    }
                    
                    const edgeCount = edgeCounts[edgeKey];
                    edgeCounts[edgeKey]++;
                    
                    let curvature = 0;
                    let smooth = { enabled: true, type: 'continuous' };
                    
                    // Add curvature for self-loops and multiple edges between same nodes
                    if (fromState === toState) {
                        // Self-loop
                        curvature = 1.5;
                        smooth = { 
                            enabled: true, 
                            type: 'curvedCW',
                            roundness: 1
                        };
                    } else if (edgeCount > 0 || edgeCounts[reverseEdgeKey] > 0) {
                        // Multiple edges between same nodes in different directions
                        curvature = 0.3 + (edgeCount * 0.2);
                        smooth = { 
                            enabled: true, 
                            type: 'curvedCW',
                            roundness: curvature
                        };
                    }

                    edges.add({
                        from: fromState,
                        to: toState,
                        label: symbol === 'e' ? 'ε' : symbol,
                        arrows: {
                            to: {
                                enabled: true,
                                scaleFactor: 1.2,
                                type: 'arrow'
                            }
                        },
                        font: { 
                            align: 'top',
                            size: 14,
                            strokeWidth: 2,
                            strokeColor: 'rgba(255,255,255,0.7)'
                        },
                        color: isActive ? '#e74c3c' : '#2c3e50',
                        width: isActive ? 3 : 2,
                        smooth: smooth,
                        physics: false
                    });
                });
            }
        }

        // Create a proper start arrow pointing to the start state
        const startNodeId = '__start__';
        nodes.add({
            id: startNodeId,
            label: '',
            color: 'rgba(0,0,0,0)',
            borderWidth: 0,
            shape: 'circle',
            size: 1,
            x: -200,
            y: 0,
            fixed: {
                x: true,
                y: true
            }
        });

        // Add the start arrow edge
        edges.add({
            from: startNodeId,
            to: startState,
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 1.5,
                    type: 'arrow'
                }
            },
            color: '#010101ff',
            width: 3,
            smooth: false,
            length: 100,
            physics: false
        });

        const data = { nodes, edges };
        const options = {
            layout: {
                randomSeed: 2, // Consistent layout
                improvedLayout: true,
                hierarchical: {
                    enabled: false
                }
            },
            physics: {
                enabled: true,
                stabilization: {
                    enabled: true,
                    iterations: 1000
                },
                barnesHut: {
                    gravitationalConstant: -8000,
                    springConstant: 0.04,
                    springLength: 95
                }
            },
            interaction: {
                dragNodes: true,
                dragView: true,
                zoomView: true,
                hover: true
            },
            nodes: {
                shapeProperties: {
                    useBorderWithImage: true
                },
                margin: {
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10
                }
            },
            edges: {
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 1.2
                    }
                },
                smooth: {
                    enabled: true,
                    type: 'continuous',
                    roundness: 0.5
                }
            },
            configure: {
                enabled: false
            }
        };

        if (network) {
            network.destroy();
        }
        network = new vis.Network(visualizationDiv, data, options);

        // Fit to screen after stabilization
        network.on("stabilizationIterationsDone", function () {
            network.fit();
        });
    }

    function simulate() {
        // Reset simulation state
        currentSimulation = null;
        currentStep = 0;
        stepPrevButton.disabled = true;
        stepNextButton.disabled = true;
        simulationStepsDiv.classList.add('hidden');
        
        try {
            const states = statesInput.value.split(',').map(s => s.trim()).filter(s => s);
            const alphabet = alphabetInput.value.split(',').map(s => s.trim()).filter(s => s);
            const startState = startStateInput.value.trim();
            const acceptStates = acceptStatesInput.value.split(',').map(s => s.trim()).filter(s => s);
            const transitionLines = transitionsInput.value.split('\n').filter(line => line.trim() !== '');

            const transitions = {};
            let isNFA = false;

            // Parse transitions
            transitionLines.forEach(line => {
                const parts = line.split('=');
                if (parts.length !== 2) {
                    throw new Error(`Invalid transition format: ${line}. Use: state,symbol=nextState`);
                }
                
                const fromAndSymbol = parts[0].split(',');
                if (fromAndSymbol.length !== 2) {
                    throw new Error(`Invalid transition format: ${line}. Use: state,symbol=nextState`);
                }
                
                const fromState = fromAndSymbol[0].trim();
                const symbol = fromAndSymbol[1].trim();
                const toState = parts[1].trim();

                if (!transitions[fromState]) {
                    transitions[fromState] = {};
                }
                if (!transitions[fromState][symbol]) {
                    transitions[fromState][symbol] = [];
                }
                transitions[fromState][symbol].push(toState);

                if (transitions[fromState][symbol].length > 1 || symbol === 'e') {
                    isNFA = true;
                }
            });

            // Validate automaton
            const errors = validateAutomaton(states, alphabet, startState, acceptStates, transitions);
            if (errors.length > 0) {
                showError(errors.join(', '));
                return;
            }
            showError('');

            // Initial visualization
            const initialStates = new Set([startState]);
            const initialClosure = isNFA ? epsilonClosure(initialStates, transitions) : initialStates;
            visualizeAutomaton(states, transitions, startState, acceptStates, initialClosure);

            const inputString = inputStringInput.value.trim();
            
            if (inputString) {
                // Create simulation steps
                currentSimulation = isNFA ? 
                    createNFASimulation(startState, acceptStates, transitions, inputString) :
                    createDFASimulation(startState, acceptStates, transitions, inputString);
                
                stepNextButton.disabled = false;
                simulationStepsDiv.classList.remove('hidden');
                updateStepDisplay();
            }

        } catch (error) {
            showError(error.message);
        }
    }

    function createDFASimulation(startState, acceptStates, transitions, inputString) {
        const steps = [];
        let currentState = startState;
        
        steps.push({
            state: currentState,
            remaining: inputString,
            symbol: 'Start',
            description: `Start at state ${currentState}`
        });

        for (let i = 0; i < inputString.length; i++) {
            const symbol = inputString[i];
            const previousState = currentState;
            
            if (transitions[currentState] && transitions[currentState][symbol]) {
                currentState = transitions[currentState][symbol][0];
                steps.push({
                    state: currentState,
                    remaining: inputString.slice(i + 1),
                    symbol: symbol,
                    description: `Read '${symbol}' from ${previousState} → ${currentState}`
                });
            } else {
                steps.push({
                    state: 'REJECT',
                    remaining: inputString.slice(i + 1),
                    symbol: symbol,
                    description: `No transition for '${symbol}' from ${currentState}`
                });
                break;
            }
        }

        const accepted = steps[steps.length - 1].state !== 'REJECT' && 
                        acceptStates.includes(steps[steps.length - 1].state);
        
        return { steps, accepted, type: 'DFA' };
    }

    function createNFASimulation(startState, acceptStates, transitions, inputString) {
        const steps = [];
        let currentStates = new Set([startState]);
        currentStates = epsilonClosure(currentStates, transitions);
        
        steps.push({
            states: new Set(currentStates),
            remaining: inputString,
            symbol: 'Start',
            description: `Start: {${Array.from(currentStates).join(', ')}}`
        });

        for (let i = 0; i < inputString.length; i++) {
            const symbol = inputString[i];
            const previousStates = new Set(currentStates);
            
            let nextStates = new Set();
            for (const state of currentStates) {
                if (transitions[state] && transitions[state][symbol]) {
                    transitions[state][symbol].forEach(nextState => {
                        nextStates.add(nextState);
                    });
                }
            }
            
            currentStates = epsilonClosure(nextStates, transitions);
            
            steps.push({
                states: new Set(currentStates),
                remaining: inputString.slice(i + 1),
                symbol: symbol,
                description: `Read '${symbol}': {${Array.from(previousStates).join(', ')}} → {${Array.from(currentStates).join(', ')}}`
            });

            if (currentStates.size === 0) break;
        }

        let accepted = false;
        for (const state of currentStates) {
            if (acceptStates.includes(state)) {
                accepted = true;
                break;
            }
        }
        
        return { steps, accepted, type: 'NFA' };
    }

    function epsilonClosure(states, transitions) {
        const stack = [...states];
        const closure = new Set(states);

        while (stack.length > 0) {
            const state = stack.pop();
            if (transitions[state] && transitions[state]['e']) {
                transitions[state]['e'].forEach(nextState => {
                    if (!closure.has(nextState)) {
                        closure.add(nextState);
                        stack.push(nextState);
                    }
                });
            }
        }
        return closure;
    }

    function updateStepDisplay() {
        if (!currentSimulation) return;

        const step = currentSimulation.steps[currentStep];
        stepsContent.innerHTML = '';

        currentSimulation.steps.forEach((s, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = `p-2 border-b ${index === currentStep ? 'bg-blue-100' : ''}`;
            
            if (currentSimulation.type === 'DFA') {
                stepDiv.innerHTML = `
                    <strong>Step ${index}:</strong> ${s.description}
                    ${s.state === 'REJECT' ? '<span class="text-red-600 ml-2">REJECTED</span>' : ''}
                `;
            } else {
                stepDiv.innerHTML = `
                    <strong>Step ${index}:</strong> ${s.description}
                    ${s.states.size === 0 ? '<span class="text-red-600 ml-2">DEAD END</span>' : ''}
                `;
            }
            
            stepsContent.appendChild(stepDiv);
        });

        // Update visualization for current step
        const states = statesInput.value.split(',').map(s => s.trim()).filter(s => s);
        const startState = startStateInput.value.trim();
        const acceptStates = acceptStatesInput.value.split(',').map(s => s.trim()).filter(s => s);
        const transitionLines = transitionsInput.value.split('\n').filter(line => line.trim() !== '');
        
        const transitions = {};
        transitionLines.forEach(line => {
            const parts = line.split('=');
            const fromAndSymbol = parts[0].split(',');
            const fromState = fromAndSymbol[0].trim();
            const symbol = fromAndSymbol[1].trim();
            const toState = parts[1].trim();

            if (!transitions[fromState]) transitions[fromState] = {};
            if (!transitions[fromState][symbol]) transitions[fromState][symbol] = [];
            transitions[fromState][symbol].push(toState);
        });

        let currentStates = null;
        if (currentSimulation.type === 'DFA' && step.state !== 'REJECT') {
            currentStates = new Set([step.state]);
        } else if (currentSimulation.type === 'NFA') {
            currentStates = step.states;
        }

        visualizeAutomaton(states, transitions, startState, acceptStates, currentStates);

        // Update result display
        if (currentStep === currentSimulation.steps.length - 1) {
            if (currentSimulation.accepted) {
                resultDiv.textContent = 'Accepted ✓';
                resultDiv.className = 'mt-4 text-center text-2xl font-bold text-green-600';
            } else {
                resultDiv.textContent = 'Rejected ✗';
                resultDiv.className = 'mt-4 text-center text-2xl font-bold text-red-600';
            }
        } else {
            resultDiv.textContent = 'Simulating...';
            resultDiv.className = 'mt-4 text-center text-2xl font-bold text-blue-600';
        }

        // Update navigation buttons
        stepPrevButton.disabled = currentStep === 0;
        stepNextButton.disabled = currentStep === currentSimulation.steps.length - 1;
    }

    // Event listeners
    simulateButton.addEventListener('click', simulate);
    
    stepPrevButton.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateStepDisplay();
        }
    });

    stepNextButton.addEventListener('click', () => {
        if (currentSimulation && currentStep < currentSimulation.steps.length - 1) {
            currentStep++;
            updateStepDisplay();
        }
    });

    // Auto-simulate when inputs change
    [statesInput, alphabetInput, startStateInput, acceptStatesInput, transitionsInput].forEach(input => {
        input.addEventListener('input', simulate);
    });

    // Initial simulation
    simulate();
});