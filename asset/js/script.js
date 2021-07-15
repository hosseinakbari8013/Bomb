class Bomb {
    constructor($container,$title, $row = null, $column = null, $bombs = null) {
        this.container = $container
        this.title = $title
        this.row = (!$row) ? 10 : 20
        this.column = (!$column) ? 10 : 20
        this.bombs = (!$bombs) ? 15 : 40
        this.StatusBomb = false;
        this.data = [] //DATA:[[1,2,1,0,null],[1,1,0,1,null],[1,3,1,1,"red"]] => 1:Bomb,0:empty digit|1:mark,0:unmark
        this.cellselector = 'cells';
        this.GenerateData()
        this.GenerateCells()
    }

    GenerateData() {
        for (let i = 1; i <= this.row; i++) {
            for (let j = 1; j <= this.column; j++) {
                this.data.push([i, j, 0,0,null,null])
            }
        }
    }

    GenerateBombs(data){
        this.StatusBomb = true;
       for (let i = 1;i<=this.bombs;i++){
           let random = Math.floor(Math.random() * this.data.length)
           if(random!==data) {
               let rand = this.data[random];
               (rand[2] !== 1) ? rand[2] = 1 : i--;
           }else{
               i--;
           }
       }
    }

    GenerateCells(GameOver=false,Win=false){
        if(Win) GameOver = false
        this.container.innerHTML='';
        let _class = this;
        let first = 0;
        let row ;
        if(Win){
            this.title.innerHTML="You Win"
        }
        else if(GameOver){
            this.title.innerHTML="GAME OVER"
        }
        this.data.forEach(function(cell){
            if(cell[0]!==first) {
                row = _class.CreateRow();
                _class.container.appendChild(row)
                first = cell[0]
            }
            let NewColumn = _class.CreateColumn();

            NewColumn.setAttribute("data",cell);
            NewColumn.setAttribute("class",_class.cellselector);
            if(cell[2]===1){
              //  NewColumn.appendChild(_class.AddIcon(true)) // debug
                if(GameOver){
                    NewColumn.appendChild(_class.AddIcon("bomb"))
                    if(cell[4]!=null){
                        NewColumn.setAttribute("class",_class.cellselector+" bomb-danger");
                    }else{
                        /*NewColumn.style.background="red"*/
                    }
                }
            }
            if(cell[5]!=null){
                NewColumn.innerHTML=cell[5];
                NewColumn.setAttribute("class",_class.cellselector+" empty digit-"+cell[5]);
            }
            if(cell[3]===2) {
                NewColumn.setAttribute("class",_class.cellselector+" empty digit-"+cell[5]);
            }else if(cell[3]===1){
                NewColumn.innerHTML='';
                NewColumn.appendChild(_class.AddIcon("flag"))
            }
            row.appendChild(NewColumn)

        });
        if(!GameOver&&!Win)this.GenerateCellClick();
    }

    GenerateCellClick(){
        let _class = this;
        let a = document.querySelectorAll("."+this.cellselector);
        a.forEach(function (a) {
            a.onclick=function () {
                _class.CellClick(a.getAttribute('data'))
            }
            let pressTimer;

            a.onmouseup=function(){
                clearTimeout(pressTimer);
                // Clear timeout
                return false;
            }
            a.onmousedown=function(){
                // Set timeout
                pressTimer = window.setTimeout(function() {
                    _class.CellLongClick(a.getAttribute('data'))
                },1000);
                return false;
            };
        })
    }

    GetAdjacent (data){
        let digit = 0;
        let a = (this.column*this.row)-1;
        let b = data-this.column;
        let c = (+data)+(+this.column);
        let datadata = this.data[data];
        if(data>=this.column&&this.data[b][2]===1){
            digit++;
        }
        if(data>=this.column&&datadata[1]>1&&this.data[b-1][2]===1){
            digit++;
        }
        if(data>=this.column&&datadata[1]<this.column&&this.data[b+1][2]===1){
            digit++;
        }
        if(data+this.column<=a &&this.data[c][2]===1){
            digit++
        }
        if(data+this.column<=a &&datadata[1]>1&&this.data[c-1][2]===1){
            digit++
        }
        if(data+this.column<=a &&datadata[1]<this.column&&this.data[c+1][2]===1){
            digit++
        }
        if(datadata[1]>1&&this.data[data-1][2]===1){
            digit++
        }
        if(datadata[1]<this.column&&this.data[data+1][2]===1){
            digit++
        }
        return digit;
    }

    GetAdjacentEmpty (data){
        let a = data-this.column;
        let dataa = this.data[a];
        if(data>=this.column&&dataa[2]===0&&dataa[5]==null&&dataa[3]===0){
            let adjacent = this.GetAdjacent(a)
            if(adjacent){
                this.data[a][5]=adjacent;
                this.data[a][3]=2;
            }else{
                this.data[a][3]=2;
                this.GetAdjacentEmpty(a)
            }
        }
        let b = (+data)+(+this.column);
        let c =(this.column*this.row)-1;
        let datab = this.data[b];
        if(b<=c&&datab[2]===0&&datab[5]==null&&datab[3]===0){
            let adjacent = this.GetAdjacent(b)
            if(adjacent){
                this.data[b][3]=2;
                this.data[b][5]=adjacent;
            }else{
                this.data[b][3]=2;
                this.GetAdjacentEmpty(b)
            }
        }
        let d = data-1
        let datad = this.data[d];
        if(this.data[data][1]>1&&datad[2]===0&&datad[5]==null&&datad[3]===0){
            let adjacent = this.GetAdjacent(d)
            if(adjacent){
                this.data[d][3]=2;
                this.data[d][5]=adjacent;
            }else{
                this.data[d][3]=2;
                this.GetAdjacentEmpty(d)
            }
        }
        let e = data+1
        let datae = this.data[e]
        if(this.data[data][1]<this.column&&datae[2]===0&&datae[5]==null&&datae[3]===0){
            let adjacent = this.GetAdjacent(e)
            if(adjacent){
                this.data[e][3]=2;
                this.data[e][5]=adjacent;
            }else{
                this.data[e][3]=2;
                this.GetAdjacentEmpty(e)
            }
        }
    }

    CheckWin(){
        let BombFlag = [];
        let clicked = [];
        this.data.forEach(function (cell) {
            if(cell[2]===1&&cell[3]===1){
                BombFlag.push(cell);
            }
            if(cell[3]===2){
                clicked.push(cell);
            }
        })
        return BombFlag.length === this.bombs || ((this.column * this.row) - this.bombs) === clicked.length;

    }

    CellClick(cell){
        cell = cell.split(',');
        let GameOver = false;
        let data = ((+cell[0]-1)*this.column)+(+cell[1])-1;
        if(!this.StatusBomb){
            this.GenerateBombs(data)
        }
        if(this.data[data][2]===1){
            this.data[data][4]=1;
            GameOver=true;
        }else if(this.data[data][2]===0){
            let adjacent = this.GetAdjacent(data);
            this.data[data][3]=2;
            if(adjacent){
                this.data[data][5]=adjacent;
            }else{
                this.GetAdjacentEmpty(data);
            }
        }
        this.GenerateCells(GameOver,this.CheckWin());
    }

    CellLongClick(cell){
        cell = cell.split(',');
        let GameOver = false;
        let data = ((+cell[0]-1)*this.column)+(+cell[1])-1;
        if(this.data[data][3]===0){
            this.data[data][3]=1;
        }else if(this.data[data][3]===1){
            this.data[data][3]=0;
        }
        this.GenerateCells(GameOver,this.CheckWin());
    }

    CreateRow() {
        return document.createElement("TR") // Create a <tr> element
    }

    CreateColumn() {
        let column = document.createElement("TD") // Create a <button> element
        column.style.width = "35px";
        column.style.height = "35px";
        return column;
    }

    AddIcon(Bomb=null){
        let icon = document.createElement("IMG")
        if(Bomb==='bomb') {
            icon.src="asset/svg/bomb.svg";
            icon.style.width = "20px";
            icon.style.height = "20px";
        }else if(Bomb==='flag'){
            icon.src="asset/svg/flag.svg";
            icon.style.width = "20px";
            icon.style.height = "20px";
        }
        return icon;
    }
}