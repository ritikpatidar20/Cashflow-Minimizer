import { BinaryHeap } from './max_heap.js';

onload = function () {
    // create a network
    let curr_data;
    const container = document.getElementById('mynetwork');//question graph
    const container2 = document.getElementById('mynetwork2');//solution graph
    const genNew = document.getElementById('generate-graph');//button for new graph
    const solve = document.getElementById('solve');//solve button
    const temptext = document.getElementById('temptext');

    // initialise graph vis.js features
    const options = {
        edges: {
            arrows: {
                to: true
            },
            labelHighlightBold: true,
            font: {
                size: 20
            }
        },
        nodes: {
            font: '12px arial red',
            scaling: {
                label: true
            },
            shape: 'icon',
            icon: {
                face: 'FontAwesome',
                code: '\uf21b',
                size: 30,
                color: 'black',
            }
        }
    };
    // initialize network!
    //Network for question graph
    let network = new vis.Network(container);
    network.setOptions(options);
    //Network for result graph
    let network2 = new vis.Network(container2);
    network2.setOptions(options);

    function createData(){
        const sz = Math.floor(Math.random() * 8) + 2; // 2<=sz<=9

        // Adding people in node array
        let nodes = [];
        for(let i=1;i<=sz;i++){
            nodes.push({id:i, label:"Person "+i})
        }
        //Prepares vis.js style nodes for our data
        nodes = new vis.DataSet(nodes);

        // Dynamically creating edges with random amount to be paid from one to another friend
        const edges = [];
        for(let i=1;i<=sz;i++){
            for(let j=i+1;j<=sz;j++){
                // Modifies the amount of edges added in the graph
                if(Math.random() > 0.5){
                    // Controls the direction of cash flow on edge
                    if(Math.random() > 0.5) //for a uniform graph this if-else block is taken
                        edges.push({from: i, to: j, label: String(Math.floor(Math.random()*100)+1)});
                    else
                        edges.push({from: j, to: i, label: String(Math.floor(Math.random()*100)+1)});
                }
            }
        }
        const data = {
            nodes: nodes,
            edges: edges
        };
        return data;
    }

    genNew.onclick = function () {
        //Create new data nd display the data
        const data = createData();
        curr_data = data;
        network.setData(data);
        temptext.style.display = "inline";
        container2.style.display = "none";
    };

    solve.onclick = function () {
        //Create graph from data and set to display
        temptext.style.display  = "none";
        container2.style.display = "inline";
        const solvedData = solveData();
        network2.setData(solvedData);
    };

    function solveData() {
        let data = curr_data;
        const sz = data['nodes'].length;
        const vals = Array(sz).fill(0);
        // Calculating net balance of each person
        for(let i=0;i<data['edges'].length;i++) {
            const edge = data['edges'][i];
            vals[edge['to'] - 1] += parseInt(edge['label']); //gets the money (-1 is done for 0 based indexing)
            vals[edge['from'] - 1] -= parseInt(edge['label']);//gives the money (-1 is done for 0 based indexing)
        }

        //max heap
        const pos_heap = new BinaryHeap(); //creating instance of the BinaryHeap class from max_heap.js 

        //min heap
        const neg_heap = new BinaryHeap(); 

        for(let i=0;i<sz;i++){
            if(vals[i]>0){
                pos_heap.insert([vals[i],i]);
            } else{
                neg_heap.insert(([-vals[i],i]));
                vals[i] *= -1; //making each element +ve 
            }
        }

        const new_edges = [];
        
        while(!pos_heap.empty() && !neg_heap.empty()){
            const mx = pos_heap.extractMax();
            const mn = neg_heap.extractMax();

            const amt = Math.min(mx[0],mn[0]);
            const to = mx[1];
            const from = mn[1];

            new_edges.push({from: from+1, to: to+1, label: String(Math.abs(amt))});//+1 to make 1 based index

            //in line 116 i have made all the element of val array +ve so need to subtract amount
            //from vals[to] and vals[from] both
            vals[to] -= amt;
            vals[from] -= amt;

            if(mx[0] > mn[0]){
                pos_heap.insert([vals[to],to]);
            } else if(mx[0] < mn[0]){
                neg_heap.insert([vals[from],from]);
            }
        }

        data = {
            nodes: data['nodes'],
            edges: new_edges
        };
        return data;
    }

    genNew.click();

};