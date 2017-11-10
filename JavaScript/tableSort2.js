function compareTR(a,b){
                var newA, newB;
                newA=a.find('td').eq(indexCell).text().replace(/ /g,"");
                newB=b.find('td').eq(indexCell).text().replace(/ /g,"");
                if(typeSort!='string'){
                    newA=parseInt(newA)?parseInt(newA):0;
                    newB=parseInt(newB)?parseInt(newB):0;
                }else{
                    newA=newA.toUpperCase();
                    newB=newB.toUpperCase();
                }
                if(a.find('td').eq(indexCell).data('sort_data')){
                    newA=a.find('td').eq(indexCell).data('sort_data');
                    console.log(newA);
                }
                if(b.find('td').eq(indexCell).data('sort_data')){
                    newB=b.find('td').eq(indexCell).data('sort_data');
                }
                if(sortDirect=='up'){
                    if (newA < newB) return 1;
                    else return -1;
                }else{
                    if (newA < newB) return -1;
                    else return 1;
                }
            }
