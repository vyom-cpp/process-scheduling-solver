document.addEventListener('DOMContentLoaded', () => {
    const algorithmSelect = document.getElementById('algorithm');
    const arrivalInput = document.getElementById('arrival-times');
    const burstInput = document.getElementById('burst-times');
    const quantumGroup = document.getElementById('quantum-group');
    const priorityGroup = document.getElementById('priority-group');
    const quantumInput = document.getElementById('time-quantum');
    const prioritiesInput = document.getElementById('priorities');
    const solveBtn = document.getElementById('solve-btn');
    const errorMsg = document.getElementById('error-message');

    const outputContent = document.getElementById('output-content');
    const emptyState = document.getElementById('empty-state');
    const algoBadge = document.getElementById('algo-badge');
    const ganttChart = document.getElementById('gantt-chart');
    const ganttTimeline = document.getElementById('gantt-timeline');
    const tableBody = document.getElementById('table-body');
    const avgTurnaround = document.getElementById('avg-turnaround');
    const avgWaiting = document.getElementById('avg-waiting');

    // Job names A, B, C...
    const getJobName = (index) => String.fromCharCode(65 + index);

    algorithmSelect.addEventListener('change', (e) => {
        const algo = e.target.value;
        quantumGroup.style.display = algo === 'rr' ? 'block' : 'none';
        priorityGroup.style.display = (algo === 'priority' || algo === 'priority_preemptive') ? 'block' : 'none';
    });

    solveBtn.addEventListener('click', () => {
        errorMsg.textContent = '';
        
        try {
            const algo = algorithmSelect.value;
            if (!algo) {
                throw new Error("Please select an algorithm.");
            }
            if (!arrivalInput.value.trim() || !burstInput.value.trim()) {
                throw new Error("Please enter arrival and burst times.");
            }
            const arrivals = arrivalInput.value.trim().split(/\s+/).map(Number);
            const bursts = burstInput.value.trim().split(/\s+/).map(Number);
            
            if (arrivals.some(isNaN) || bursts.some(isNaN)) {
                throw new Error("Invalid input. Please enter space-separated numbers.");
            }
            if (arrivals.length !== bursts.length) {
                throw new Error("Number of arrival times must match burst times.");
            }
            if (bursts.some(b => b <= 0)) {
                throw new Error("Burst times must be greater than 0.");
            }

            const n = arrivals.length;
            let processes = [];
            for (let i = 0; i < n; i++) {
                processes.push({
                    id: getJobName(i),
                    pid: i,
                    arrival: arrivals[i],
                    burst: bursts[i],
                    remaining: bursts[i],
                    finish: 0,
                    turnaround: 0,
                    waiting: 0
                });
            }

            let result;

            switch (algo) {
                case 'fcfs':
                    result = solveFCFS(processes);
                    algoBadge.textContent = 'FCFS';
                    break;
                case 'sjf':
                    result = solveSJF(processes);
                    algoBadge.textContent = 'SJF';
                    break;
                case 'srtf':
                    result = solveSRTF(processes);
                    algoBadge.textContent = 'SRTF';
                    break;
                case 'rr':
                    const q = parseInt(quantumInput.value);
                    if (isNaN(q) || q <= 0) throw new Error("Invalid time quantum.");
                    result = solveRR(processes, q);
                    algoBadge.textContent = 'RR';
                    break;
                case 'priority':
                    const priorities = prioritiesInput.value.trim().split(/\s+/).map(Number);
                    if (priorities.some(isNaN) || priorities.length !== n) {
                        throw new Error("Invalid priorities input.");
                    }
                    for (let i = 0; i < n; i++) processes[i].priority = priorities[i];
                    result = solvePriority(processes);
                    algoBadge.textContent = 'PRIORITY';
                    break;
                case 'priority_preemptive':
                    const prioritiesP = prioritiesInput.value.trim().split(/\s+/).map(Number);
                    if (prioritiesP.some(isNaN) || prioritiesP.length !== n) {
                        throw new Error("Invalid priorities input.");
                    }
                    for (let i = 0; i < n; i++) processes[i].priority = prioritiesP[i];
                    result = solvePriorityPreemptive(processes);
                    algoBadge.textContent = 'PRIORITY (PREEMPTIVE)';
                    break;
            }

            renderOutput(result.processes, result.gantt);

        } catch (error) {
            errorMsg.textContent = error.message;
        }
    });

    function renderOutput(processes, gantt) {
        emptyState.classList.add('hidden');
        outputContent.classList.remove('hidden');

        // Render Table
        tableBody.innerHTML = '';
        let totalTurnaround = 0;
        let totalWaiting = 0;

        // Sort processes back to original order (A, B, C...) for table display
        processes.sort((a, b) => a.pid - b.pid);

        processes.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.arrival}</td>
                <td>${p.burst}</td>
                <td>${p.finish}</td>
                <td>${p.turnaround}</td>
                <td>${p.waiting}</td>
            `;
            tableBody.appendChild(tr);
            totalTurnaround += p.turnaround;
            totalWaiting += p.waiting;
        });

        avgTurnaround.innerHTML = `${totalTurnaround} / ${processes.length} = <strong>${(totalTurnaround/processes.length).toFixed(2)}</strong>`;
        avgWaiting.innerHTML = `${totalWaiting} / ${processes.length} = <strong>${(totalWaiting/processes.length).toFixed(2)}</strong>`;

        // Render Gantt
        ganttChart.innerHTML = '';
        ganttTimeline.innerHTML = '';
        
        if (gantt.length === 0) return;

        const totalTime = gantt[gantt.length - 1].end - gantt[0].start;
        
        // Add start marker
        addTimeMarker(gantt[0].start, 0);

        let currentPercent = 0;

        gantt.forEach((block, index) => {
            const blockDuration = block.end - block.start;
            const percentWidth = (blockDuration / totalTime) * 100;
            
            if(block.id === 'IDLE') {
                const div = document.createElement('div');
                div.className = 'gantt-block';
                div.style.width = `${percentWidth}%`;
                div.style.backgroundColor = '#f1f5f9';
                div.style.color = '#94a3b8';
                div.textContent = 'IDLE';
                ganttChart.appendChild(div);
            } else {
                const div = document.createElement('div');
                div.className = 'gantt-block';
                div.style.width = `${percentWidth}%`;
                div.textContent = block.id;
                ganttChart.appendChild(div);
            }

            currentPercent += percentWidth;
            
            // Only add marker if the next block doesn't start at the same time, or it's the last block
            if (index === gantt.length - 1 || gantt[index+1].start !== block.end) {
                addTimeMarker(block.end, currentPercent);
            }
        });
    }

    function addTimeMarker(time, leftPercent) {
        const span = document.createElement('span');
        span.className = 'time-marker';
        span.textContent = time;
        span.style.left = `${leftPercent}%`;
        ganttTimeline.appendChild(span);
    }

    // --- Scheduling Algorithms ---

    function solveFCFS(processes) {
        let procs = [...processes].sort((a, b) => a.arrival - b.arrival);
        let time = 0;
        let gantt = [];

        procs.forEach(p => {
            if (time < p.arrival) {
                gantt.push({ id: 'IDLE', start: time, end: p.arrival });
                time = p.arrival;
            }
            gantt.push({ id: p.id, start: time, end: time + p.burst });
            time += p.burst;
            
            p.finish = time;
            p.turnaround = p.finish - p.arrival;
            p.waiting = p.turnaround - p.burst;
        });

        return { processes: procs, gantt };
    }

    function solveSJF(processes) {
        let procs = [...processes].map(p => ({...p, completed: false}));
        let time = 0;
        let completedCount = 0;
        let gantt = [];
        const n = procs.length;

        while (completedCount < n) {
            let idx = -1;
            let minBurst = Infinity;

            for (let i = 0; i < n; i++) {
                if (procs[i].arrival <= time && !procs[i].completed) {
                    if (procs[i].burst < minBurst) {
                        minBurst = procs[i].burst;
                        idx = i;
                    }
                }
            }

            if (idx !== -1) {
                gantt.push({ id: procs[idx].id, start: time, end: time + procs[idx].burst });
                time += procs[idx].burst;
                procs[idx].completed = true;
                procs[idx].finish = time;
                procs[idx].turnaround = procs[idx].finish - procs[idx].arrival;
                procs[idx].waiting = procs[idx].turnaround - procs[idx].burst;
                completedCount++;
            } else {
                let nextArrival = Math.min(...procs.filter(p => !p.completed).map(p => p.arrival));
                gantt.push({ id: 'IDLE', start: time, end: nextArrival });
                time = nextArrival;
            }
        }
        return { processes: procs, gantt };
    }

    function solveSRTF(processes) {
        let procs = [...processes];
        let time = 0;
        let completedCount = 0;
        const n = procs.length;
        let gantt = [];
        let prevId = null;

        while (completedCount < n) {
            let idx = -1;
            let minRemaining = Infinity;

            for (let i = 0; i < n; i++) {
                if (procs[i].arrival <= time && procs[i].remaining > 0) {
                    if (procs[i].remaining < minRemaining) {
                        minRemaining = procs[i].remaining;
                        idx = i;
                    }
                }
            }

            if (idx !== -1) {
                if (prevId !== procs[idx].id) {
                    if (prevId !== null && gantt.length > 0 && gantt[gantt.length-1].id === prevId) {
                        gantt[gantt.length-1].end = time;
                    }
                    gantt.push({ id: procs[idx].id, start: time, end: time + 1 });
                } else {
                    gantt[gantt.length-1].end = time + 1;
                }
                
                prevId = procs[idx].id;
                procs[idx].remaining--;
                time++;

                if (procs[idx].remaining === 0) {
                    procs[idx].finish = time;
                    procs[idx].turnaround = procs[idx].finish - procs[idx].arrival;
                    procs[idx].waiting = procs[idx].turnaround - procs[idx].burst;
                    completedCount++;
                    prevId = null; // force new block
                }
            } else {
                if (prevId !== 'IDLE') {
                    gantt.push({ id: 'IDLE', start: time, end: time + 1 });
                    prevId = 'IDLE';
                } else {
                    gantt[gantt.length-1].end = time + 1;
                }
                time++;
            }
        }
        return { processes: procs, gantt };
    }

    function solveRR(processes, quantum) {
        let procs = [...processes];
        let n = procs.length;
        let time = 0;
        let completedCount = 0;
        let gantt = [];
        
        let queue = [];
        let inQueue = new Array(n).fill(false);
        
        // Sort by arrival time initially to handle simultaneous arrivals correctly
        let sortedByArrival = procs.map((p, i) => ({...p, originalIdx: i})).sort((a,b) => a.arrival - b.arrival);
        
        let initialArrival = sortedByArrival[0].arrival;
        if(initialArrival > 0) {
            time = initialArrival;
            gantt.push({ id: 'IDLE', start: 0, end: time });
        }

        while (completedCount < n) {
            // enqueue new arrivals
            for (let i = 0; i < n; i++) {
                let pIdx = sortedByArrival[i].originalIdx;
                if (procs[pIdx].arrival <= time && procs[pIdx].remaining > 0 && !inQueue[pIdx]) {
                    queue.push(pIdx);
                    inQueue[pIdx] = true;
                }
            }

            if (queue.length > 0) {
                let idx = queue.shift();
                inQueue[idx] = false;

                let execTime = Math.min(quantum, procs[idx].remaining);
                
                gantt.push({ id: procs[idx].id, start: time, end: time + execTime });
                time += execTime;
                procs[idx].remaining -= execTime;

                if (procs[idx].remaining === 0) {
                    procs[idx].finish = time;
                    procs[idx].turnaround = procs[idx].finish - procs[idx].arrival;
                    procs[idx].waiting = procs[idx].turnaround - procs[idx].burst;
                    completedCount++;
                } else {
                    // check arrivals during execution
                    for (let i = 0; i < n; i++) {
                        let pIdx = sortedByArrival[i].originalIdx;
                        if (procs[pIdx].arrival <= time && procs[pIdx].remaining > 0 && !inQueue[pIdx] && pIdx !== idx) {
                            queue.push(pIdx);
                            inQueue[pIdx] = true;
                        }
                    }
                    queue.push(idx);
                    inQueue[idx] = true;
                }
            } else {
                // IDLE
                let nextArrival = Infinity;
                for(let i=0; i<n; i++) {
                    if(procs[i].remaining > 0 && procs[i].arrival > time && procs[i].arrival < nextArrival) {
                        nextArrival = procs[i].arrival;
                    }
                }
                gantt.push({ id: 'IDLE', start: time, end: nextArrival });
                time = nextArrival;
            }
        }

        // merge contiguous identical blocks in gantt
        let mergedGantt = [];
        for (let i=0; i<gantt.length; i++) {
            if (mergedGantt.length > 0 && mergedGantt[mergedGantt.length-1].id === gantt[i].id) {
                mergedGantt[mergedGantt.length-1].end = gantt[i].end;
            } else {
                mergedGantt.push({...gantt[i]});
            }
        }

        return { processes: procs, gantt: mergedGantt };
    }

    function solvePriority(processes) {
        let procs = [...processes].map(p => ({...p, completed: false}));
        let time = 0;
        let completedCount = 0;
        let gantt = [];
        const n = procs.length;

        while (completedCount < n) {
            let idx = -1;
            let minPriority = Infinity;

            for (let i = 0; i < n; i++) {
                if (procs[i].arrival <= time && !procs[i].completed) {
                    if (procs[i].priority < minPriority) {
                        minPriority = procs[i].priority;
                        idx = i;
                    }
                }
            }

            if (idx !== -1) {
                gantt.push({ id: procs[idx].id, start: time, end: time + procs[idx].burst });
                time += procs[idx].burst;
                procs[idx].completed = true;
                procs[idx].finish = time;
                procs[idx].turnaround = procs[idx].finish - procs[idx].arrival;
                procs[idx].waiting = procs[idx].turnaround - procs[idx].burst;
                completedCount++;
            } else {
                let nextArrival = Math.min(...procs.filter(p => !p.completed).map(p => p.arrival));
                gantt.push({ id: 'IDLE', start: time, end: nextArrival });
                time = nextArrival;
            }
        }
        return { processes: procs, gantt };
    }

    function solvePriorityPreemptive(processes) {
        let procs = [...processes];
        let time = 0;
        let completedCount = 0;
        const n = procs.length;
        let gantt = [];
        let prevId = null;

        while (completedCount < n) {
            let idx = -1;
            let minPriority = Infinity;

            for (let i = 0; i < n; i++) {
                if (procs[i].arrival <= time && procs[i].remaining > 0) {
                    if (procs[i].priority < minPriority) {
                        minPriority = procs[i].priority;
                        idx = i;
                    }
                }
            }

            if (idx !== -1) {
                if (prevId !== procs[idx].id) {
                    if (prevId !== null && gantt.length > 0 && gantt[gantt.length-1].id === prevId) {
                        gantt[gantt.length-1].end = time;
                    }
                    gantt.push({ id: procs[idx].id, start: time, end: time + 1 });
                } else {
                    gantt[gantt.length-1].end = time + 1;
                }
                
                prevId = procs[idx].id;
                procs[idx].remaining--;
                time++;

                if (procs[idx].remaining === 0) {
                    procs[idx].finish = time;
                    procs[idx].turnaround = procs[idx].finish - procs[idx].arrival;
                    procs[idx].waiting = procs[idx].turnaround - procs[idx].burst;
                    completedCount++;
                    prevId = null; // force new block
                }
            } else {
                if (prevId !== 'IDLE') {
                    gantt.push({ id: 'IDLE', start: time, end: time + 1 });
                    prevId = 'IDLE';
                } else {
                    gantt[gantt.length-1].end = time + 1;
                }
                time++;
            }
        }
        return { processes: procs, gantt };
    }
});
