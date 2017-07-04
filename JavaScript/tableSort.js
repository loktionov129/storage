	$('.MYTABLE').on('click', 'td[data-sort]', function(){
		var indexCell=$(this).index(),
			sortDirect=($(this).hasClass('adm-list-table-cell-sort') || $(this).hasClass('adm-list-table-cell-sort-up'))?'down':'up',
			typeSort=$(this).data('sort'),
			trArr=[],
			tmpStr='',
			nextClass='adm-list-table-cell-sort-'+sortDirect,
			sortFirstCol=($(this).closest('table').data('number')=='Y')?false:true;
			
			$(this).closest('table').find('tbody tr').each(function(){
				trArr.push($(this));
			});

			trArr.sort(compareTR);
	
			function compareTR(a,b){
				if(a.find('td').eq(indexCell).find('a').length>0){
					var newA=a.find('td').eq(indexCell).find('a').html().replace(/ /g,"");
					if(b.find('td').eq(indexCell).find('a').length>0)
						var newB=b.find('td').eq(indexCell).find('a').html().replace(/ /g,"");
				}else{
					var newA=a.find('td').eq(indexCell).html().replace(/ /g,""),
						newB=b.find('td').eq(indexCell).html().replace(/ /g,"");
				}
				if(typeSort!='string'){
					var newA=parseInt(newA),
						newB=parseInt(newB);
				}
				if(a.find('td').eq(indexCell).data('sort_data')){
					newA=a.find('td').eq(indexCell).data('sort_data');
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
			var nextRow='';
			for(var i=0; i<trArr.length; i++){
				nextRow=$(trArr[i]);
				if(!sortFirstCol){
					nextRow.find('td').eq(0).text((i+1));
				}
				tmpStr+='<tr class="adm-list-table-row">'+nextRow.html()+'</tr>';
			}
			$(this).closest('table').find('tbody').html(tmpStr);
			$(this).closest('tr').find('td').removeClass('adm-list-table-cell-sort-down').removeClass('adm-list-table-cell-sort-up').addClass('adm-list-table-cell-sort');
			$(this).addClass(nextClass).removeClass('adm-list-table-cell-sort');
	});
