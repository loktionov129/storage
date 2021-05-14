package com.example.samples;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;
import android.widget.SimpleAdapter;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class ListViewDemo extends Activity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.listview_demo);

        fillListView();
    }

    private void fillListView() {
        String[] from = new String[] { "text", "button" };
        int[] to = new int[] { R.id.text, R.id.button };
        List<HashMap<String, Object>> fillMaps = new ArrayList<>();

        HashMap<String, Object> map = new HashMap<>();
        map.put("text", "Item #1");
        map.put("button", "handle");
        fillMaps.add(map);

        map = new HashMap<>();
        map.put("text", "Item #2");
        map.put("button", "handle");
        fillMaps.add(map);

        SimpleAdapter adapter = new SimpleAdapter(this, fillMaps, R.layout.listview_list_item, from, to);

        ListView listView = findViewById(R.id.listView);
        listView.setAdapter(adapter);
    }

    public void handleClick(View view) {
        Button button = (Button)view;
        button.setText("clicked!");
    }
}
