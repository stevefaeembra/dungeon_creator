// procedural dungeon generator

class World {

    constructor(width,height) {
        this.width = width;
        this.height = height;
        this.world = [];
        for (let row=0;row<this.height;row++) {
            this.world.push(new Array(this.width).fill(0));
        }
        this.rooms = 0;
    }

    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    getCellAt(row,col) {
        return this.world[row][col];
    }
   
    dumpAscII() {
        // dump world as ASCII
        let result = [];
        for (let row=0; row<this.height; row++) {
            let thisrow = [];
            for (let col=0;col<this.width;col++) {
                switch (this.world[row][col]) {
                    case 0:
                        thisrow.push(' ');
                        break;
                    case 1:
                        thisrow.push('.');
                        break;
                    case 2:
                        thisrow.push('#');
                        break;
                    case 3:
                        thisrow.push('.'); // vertical door
                        break;
                    case 4:
                        thisrow.push('.'); // horizontal door
                        break;        
                    default:
                        thisrow.push('?');
                        break;
                }
            }
            result.push(thisrow.join(''));
        }
        return result;
    }

    roomOverlaps(minx,miny,maxx,maxy) {
        // return true if we overlap an existing room
        let result = false;
        for (let y=miny;y<maxy;y++) {
            for (let x=minx;x<maxx;x++) {
                if (this.world[x][y]===1) {
                    result = true;
                }
            }
        };
        return result;
    }

    roomAdjacent(minx,miny,maxx,maxy) {
        // return true if buffer borders on existing
        // the total area of overlap must be >4 cells
        // this makes sure we have enough overlap to add a door
        // and prevents rooms 'kissing at the corners' with no 
        // space to add a door.
        let result = false;
        let areaOverlap = 0;
        for (let y=miny;y<maxy;y++) {
            for (let x=minx;x<maxx;x++) {
                if (this.world[x][y]>0) {
                    //result = true;
                    areaOverlap += 1;
                }
            }
        };
        return areaOverlap > 4;
    }

    carveOutRoom(minx,miny,maxx,maxy) {
        // bounds refer to the original floor plan
        const bufferLeft = minx-1;
        const bufferRight = maxx+1;
        const bufferTop = miny-1;
        const bufferBottom = maxy+1;
        for (let y=bufferTop;y<bufferBottom;y++) {
            for (let x=bufferLeft;x<bufferRight;x++) {
                this.world[x][y] = 2; // wall tile
            }
        };
        for (let y=miny;y<maxy;y++) {
            for (let x=minx;x<maxx;x++) {
                this.world[x][y] = 1; // floor tile
            }
        };

    }


    placeDoors() {
        for (let y=0;y<this.height;y++) {
            for (let x=0;x<this.width;x++) {
                this.placeDoor(x,y);
            }
        };
    }

    placeDoor(row,col) {
        // attempt to place a door
        if (this.world[row][col]!==2) return;
        if (row<1) return;
        if (row>this.height-1) return;
        if (col<1) return;
        if (col>this.width-1) return;
        // neighbouring cells
        let left = col - 1;
        let right = col + 1;
        let up = row - 1;
        let down = row + 1;
        // vertical?
        if (this.world[up][col]===1 && 
            this.world[down][col]===1 &&
            this.world[row][left]===2 &&
            this.world[row][right]===2) {
            this.world[row][col] = 3; // vertical door
        }
        // horizontal?
        if (this.world[up][col]===2 && 
            this.world[down][col]===2 &&
            this.world[row][left]===1 &&
            this.world[row][right]===1) {
            this.world[row][col] = 4; // horizontal door
        }
    }

    placeRoom() {
        const roomWidth = this.randInt(3,12);
        const roomHeight = this.randInt(3,12);
        const minx = this.randInt(0,this.width);
        const miny = this.randInt(0,this.height);
        const bufferLeft = minx-1;
        const bufferRight = minx+roomWidth+1;
        const bufferTop = miny-1;
        const bufferBottom = miny+roomHeight+1;
        if (bufferLeft<0) return;
        if (bufferRight>=this.width) return;
        if (bufferTop<0) return;
        if (bufferBottom>=this.height) return;
        if (this.rooms>0) {
            // ensure it borders existing room, unless first rooms
            if (!this.roomAdjacent(bufferLeft,bufferTop,bufferRight,bufferBottom)) {
                return;
            }
            // make sure it doesn't overlap
            if (this.roomOverlaps(bufferLeft,bufferTop,bufferRight,bufferBottom)) {
                return;
            }
        };
        // etch out the room
        this.carveOutRoom(minx,miny,minx+roomWidth,miny+roomHeight);
        this.rooms += 1;
    }

};

module.exports = World;