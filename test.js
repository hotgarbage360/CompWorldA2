function lineLine(x1,y1,x2,y2,x3,y3,x4,y4){
    var m1 = (y2-y1)/(x2-x1);
    var m2 = (y4-y3)/(x4-x3);
    //lines aren't parallel
    if(m1!==m2 && m1!=-m2){
        //point of intersection
        var xi = (m1*x1-m2*x3-y1+y3)/(m1-m2);
        var yi = m1*(xi-x1)+y1;
        var xstart = x1;
        var ystart = y1;
        var xend = x2;
        var yend = y2;
        if(x1>x2){
            xstart = x2;
            xend = x1;
        }
        if(y1>y2){
            ystart = y2;
            yend = y1;
        }
        //check if intersection point lies in the range of the line segment
        if(xstart<=xi && xi<=xend && ystart<=yi && yi<=yend){
            return true;
        } else {
            return false;
        }
    } else if(y1-(m1*x1) === y3-(m2*x3)){
        //lines are parallel and have same y-intercept, so they
        //must be the same line
        return true;
    } else {
        return false;
    }
}