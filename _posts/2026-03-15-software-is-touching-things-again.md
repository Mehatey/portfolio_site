---
layout: post
title: software is touching things again
date: 2026-03-15
description: on books, paint, gestures, and the slow return of physical computing.
tags: physical-computing design hardware
categories: essays
related_posts: false
---

For most of my life as a designer, software has been allergic to the physical world. You touched it through glass, and only through glass. The keyboard, the mouse, the trackpad, the phone surface. Generations of interaction design grew up inside that one constraint: the only thing the computer could feel was a finger pressing flat plastic.

That constraint is quietly ending, and almost nobody is talking about it.

The signal I keep watching is small projects, not big platforms. A student in Tokyo who built a sketchbook that recognizes the page you are drawing on and pulls up matching references. An artist in Berlin who wired a coffee cup to a synthesizer. A team in Bangalore making AR overlays for chalk drawings on the street. None of these are products. All of them are signs.

I spent the last few months building a printed artist book that triggers AR experiences when the camera sees specific pages. The book is real. You can smell the ink. You can dog-ear the corners. When you point your phone at a plate, a three-dimensional sculpture grows out of the page, anchored to the page so precisely that you can walk around it, tilt the book, close it, and the sculpture obediently leaves. The book is not a controller for the software. The book is the software. The bytes are just there to keep the promise the paper made.

This is, in some ways, very old. Physical computing as a discipline is decades old. Hiroshi Ishii's tangible bits work at MIT is from the nineties. Durrell Bishop's marble answering machine is from 1992. The dream of the computer escaping the glass has been around longer than I have. What is different now is that the pieces finally cost almost nothing.

A computer vision model that can recognize a specific page of a book, in real time, on a phone, used to be a research paper. It is now a four-line API call. A voice model that can hold a five-minute conversation used to be a science fiction premise. It is now a developer key. A gesture sensor used to be a Kinect plus a graduate thesis. It is now a standard component of every set of glasses that will ship in the next three years.

When the parts get cheap, the question stops being "can we build it" and starts being "what should it feel like." That second question is a design question, and most of the industry is still answering the first one.

The interesting design work happening right now is at the seams. Where the paper meets the pixel. Where the room meets the voice. Where the gesture meets the response. The hard part is not making any one of those modalities work. The hard part is making them stop feeling like separate systems bolted to each other, and start feeling like one continuous thing.

I think there are three things this new generation of physical computing actually requires from designers, and almost none of them are taught in school.

The first is patience with materials. Pixels are infinitely cheap. Paper is not. If you are going to print a book that triggers an AR scene, you are going to print it once, and the proof will arrive in a box six weeks later, and the misalignment between the trim and the marker will be your problem to solve in software. Software people are used to instant feedback. Physical people are used to waiting. The hybrid practice requires both temperaments at once.

The second is a tolerance for the analog failure mode. Glass interfaces fail clean. The button works or it does not. Physical interfaces fail in gradients. The light was a little too dim, the page was a little too wrinkled, the user spoke a little too softly. A good physical-software product designs for the smear, not for the edge case. It assumes the world will be a little wrong, and tries to be right anyway.

The third is restraint. The temptation when software escapes the glass is to put software on everything. Smart fork, smart mirror, smart toilet seat. Most of these are bad. The objects that have lived in our houses for centuries got that way by being good at being objects. A book is a beautifully solved interface for storing words. It does not need a chip in the spine. It might, occasionally, need a chip in the room.

The shift back toward physical computing is not a rejection of digital. It is the digital growing up enough to stop demanding center stage. The most exciting interface I will design this year is one you will not notice you are using. You will pick up an object, and the right thing will happen, and you will not stop to thank the software, because the software will have had the good sense to be invisible.

That is the version of the future I am betting my practice on. Not screens everywhere. Screens nowhere. Just things, behaving the way you always sort of hoped they would.
