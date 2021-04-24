package com.example.samples;

import android.app.Activity;
import android.os.Bundle;
import android.widget.ImageView;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.Arrays;

public class ImageCarousel extends Activity {
    private int currentImageIndex = 0;
    private final ArrayList<Integer> imagesIds = new ArrayList<>();

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.image_carousel);
        imagesIds.addAll(
            Arrays.asList(
                R.drawable.debian,
                R.drawable.android,
                R.drawable.ios
            )
        );

        ImageView imageView = findViewById(R.id.mainImageView);
        imageView.setImageResource(imagesIds.get(currentImageIndex));
        imageView.setOnClickListener(v -> {
            currentImageIndex++;

            if (currentImageIndex == imagesIds.size()) {
                currentImageIndex = 0;
            }

            imageView.setImageResource(imagesIds.get(currentImageIndex));
        });
    }
}
