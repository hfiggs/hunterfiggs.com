graph = function(){

class Graph 
{
    constructor(numNodes)
    {
        this.AdjMatrix = new Array.matrix(numNodes, numNodes, 0);
    }

    addEdge(node1, node2, weight)
    {
        this.AdjMatrix[node1][node2] = weight;
        this.AdjMatrix[node2][node1] = weight;
    }
}

Array.matrix = function(rows, cols, init)
{
    let arr = new Array(rows);
    for(let i = 0; i < rows; i++)
    {
        arr[i] = new Array(cols);
        for(let j = 0; j < cols; j++)
        {
            arr[i][j] = init;
        }
    }

    return arr;
}

// e holds boardData, startId, finishId
onmessage = function(e)
{
    let startNode = e.data[1].split('-')[0] * e.data[0][0].length + e.data[1].split('-')[1]*1;
    let finishNode = e.data[2].split('-')[0] * e.data[0][0].length + e.data[2].split('-')[1]*1;

    let numNodes = e.data[0].length * e.data[0][0].length;

    let graph = gridToGraph(e.data[0]);

    // distance to reach each node
    let dist = new Array(numNodes);
    
    // if each node has been processed
    let proc = new Array(numNodes);

    // parent node of each node in shortest path tree
    let parent = new Array(numNodes);

    // initialize the arrays
    for(let i = 0; i < numNodes; i++)
    {
        dist[i] = Infinity;
        proc[i] = false;
        parent[i] = -1;
    }

    // distance to start node is 0
    dist[startNode] = 0;

    for (let i = 0; i < numNodes; i++)
    {
        // TODO: check if undefined
        // find closest, unprocessed node and add it to list of processed
        let newNode = minDistanceNode(dist, proc);

        // if no path available, quit
        if(newNode === undefined)
        {
            postMessage([0]);
            close();
        }
        else if(newNode===finishNode)
        {
            postMessage([2,parent]);
            close();
        }
        proc[newNode] = true;

        // update distances of all nodes adjacent to new node
        for (let j = 0; j < numNodes; j++)
        {
            if((!proc[j])&&(graph.AdjMatrix[newNode][j]>0)&&(dist[newNode]+graph.AdjMatrix[newNode][j]<dist[j]))
            {
                parent[j] = newNode;
                dist[j] = dist[newNode] + graph.AdjMatrix[newNode][j];
            }
        }

        sleep(3);
        postMessage([1,newNode]);
    }
}

function sleep(milliseconds)
{
    const date = Date.now();
    let currentDate = null;
    do
    {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function minDistanceNode(dist, proc)
{
    let minNode;
    let minDist = Infinity;

    for(let i = 0; i < proc.length; i++)
    {
        if((!proc[i])&&(dist[i]<minDist))
        {
            minNode = i;
            minDist = dist[minNode];
        }
    }

    return minNode;
}

function gridToGraph(grid)
{
    let numNodes = grid.length * grid[0].length;

    let graph = new Graph(numNodes);

    // for each node in the grid
    for(let i = 0; i < grid.length; i++){
        for(let j = 0; j < grid[0].length; j++){
            
            // loop through its neighbors
            for(let r = -1; r <= 1; r++){
                for(let c = -1; c <= 1; c++){

                    try{
                        let nodeNotWall = grid[i][j];
                        let neighborNotWall = grid[i+r][j+c];
                        if(nodeNotWall&&neighborNotWall&&!(r===0&&c===0)){
                            let nodePos = i*grid[0].length+j;
                            let neighborPos = nodePos + (r*grid[0].length) + c;
                            if(r===0||c===0){
                                graph.addEdge(nodePos,neighborPos, 1);
                            }else{
                                graph.addEdge(nodePos,neighborPos,Math.sqrt(2));
                            }
                        }
                    }
                    catch{
                        // out of bounds (no neighbor here)
                    }
                }
            }
        }
    }

    // let check = new Array(numNodes);
    // for(i=0; i<graph.AdjMatrix.length; i++){
    //     check[i] = 0;
    //     for(j=0; j<graph.AdjMatrix.length; j++){
    //         if(graph.AdjMatrix[i][j]>0){
    //             check[i]+=1;
    //         }
    //     }   
    // }

    return graph;
}

}();