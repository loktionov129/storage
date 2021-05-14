package com.example.samples;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import androidx.annotation.Nullable;

import java.util.Locale;

public class RoutingViaIntent extends Activity {
    private static final int fillFormRequestCode = 1;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.routing_via_intent);
    }

    @Override
    protected void onStart() {
        super.onStart();
        EditText randomNumberText = findViewById(R.id.random_number);
        int randomNumber = getRandomNumber(10000, 99999);
        randomNumberText.setText(String.format(Locale.ENGLISH, "%d", randomNumber));
    }

    public void onFillForm(View view) {
        EditText randomNumberText = findViewById(R.id.random_number);
        Intent intent = new Intent(this, RoutingViaIntentFillForm.class);
        String randomNumber = randomNumberText.getText().toString();
        intent.putExtra("random_number", randomNumber);
        startActivityForResult(intent, fillFormRequestCode);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (resultCode != RESULT_OK) {
            return;
        }

        if (requestCode == fillFormRequestCode) {
            TextView loginView = findViewById(R.id.login);
            loginView.setText(data.getStringExtra("login"));

            TextView passwordView = findViewById(R.id.password);
            passwordView.setText(data.getStringExtra("password"));
        }
    }

    private int getRandomNumber(int min, int max) {
        return (int) ((Math.random() * (max - min)) + min);
    }
}
