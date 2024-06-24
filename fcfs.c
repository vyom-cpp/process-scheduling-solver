#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

#define MAX_PROCESSES 10

typedef struct
{
    int pid;
    int arrival_time;
    int burst_time;
    int completion_time;
    int turnaround_time;
    int waiting_time;
} Process;

void sort_by_arrival_time(Process proc[], int n);
void fcfs(Process proc[], int n);
void display(Process proc[], int n);

int main()
{
    Process proc[MAX_PROCESSES];
    int n;

    printf("Enter the number of processes: ");
    scanf("%d", &n);

    for (int i = 0; i < n; i++)
    {
        proc[i].pid = i + 1;
        printf("Enter arrival time and burst time for process %d: ", i + 1);
        scanf("%d%d", &proc[i].arrival_time, &proc[i].burst_time);
    }

    fcfs(proc, n);
    display(proc, n);

    return 0;
}

void sort_by_arrival_time(Process proc[], int n)
{
    Process temp;
    for (int i = 0; i < n - 1; i++)
    {
        for (int j = 0; j < n - i - 1; j++)
        {
            if (proc[j].arrival_time > proc[j + 1].arrival_time)
            {
                temp = proc[j];
                proc[j] = proc[j + 1];
                proc[j + 1] = temp;
            }
        }
    }
}

void fcfs(Process proc[], int n)
{
    sort_by_arrival_time(proc, n);
    int time = 0;
    for (int i = 0; i < n; i++)
    {
        if (time < proc[i].arrival_time)
        {
            time = proc[i].arrival_time;
        }
        proc[i].completion_time = time + proc[i].burst_time;
        time = proc[i].completion_time;

        proc[i].turnaround_time = proc[i].completion_time - proc[i].arrival_time;
        proc[i].waiting_time = proc[i].turnaround_time - proc[i].burst_time;
    }
}

void display(Process proc[], int n)
{
    printf("\nPID\tArrival\tBurst\tCompletion\tTurnaround\tWaiting\n");
    for (int i = 0; i < n; i++)
    {
        printf("%d\t%d\t%d\t%d\t\t%d\t\t%d\n",
               proc[i].pid, proc[i].arrival_time, proc[i].burst_time,
               proc[i].completion_time, proc[i].turnaround_time, proc[i].waiting_time);
    }
}