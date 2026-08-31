"""Score for 'The Idea' - synthesised, no samples.
Everything is built from oscillators, filtered noise and a convolution tail,
so the whole score is one file with no dependencies.
"""
import numpy as np, wave, os, math

SR = 44100
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(8)
mix = np.zeros(N, np.float32)


def at(t):
    return int(t * SR)


def env(n, a, d, s, r, sus=0.7):
    """Simple ADSR over n samples (seconds in, samples out)."""
    a, d, r = max(1, int(a*SR)), max(1, int(d*SR)), max(1, int(r*SR))
    s = max(0, n - a - d - r)
    e = np.concatenate([
        np.linspace(0, 1, a),
        np.linspace(1, sus, d),
        np.full(s, sus),
        np.linspace(sus, 0, r)])
    return e[:n] if len(e) >= n else np.pad(e, (0, n-len(e)))


def tone(f, t0, dur, amp=0.2, partials=(1, 2, 3), weights=(1, .35, .14),
         a=.01, d=.08, r=.4, detune=0.0, sus=0.55):
    n = int(dur*SR)
    t = np.arange(n)/SR
    sig = np.zeros(n, np.float32)
    for p, w in zip(partials, weights):
        sig += w*np.sin(2*np.pi*f*p*t + detune*np.sin(2*np.pi*0.7*t))
    sig *= env(n, a, d, 0, r, sus) * amp
    i = at(t0)
    m = min(N-i, n)
    if m > 0:
        mix[i:i+m] += sig[:m]


def noise_hit(t0, dur, amp=0.14, lo=0.02, hi=0.5, a=.004, r=.25):
    n = int(dur*SR)
    x = rng.normal(0, 1, n).astype(np.float32)
    # cheap band-pass: difference of two running means
    def smooth(sig, k):
        k = max(1, int(k))
        c = np.cumsum(np.insert(sig, 0, 0))
        return (c[k:] - c[:-k]) / k
    lowk = max(2, int(1/hi*40)); hik = max(2, int(1/lo*40))
    a1 = smooth(x, lowk); a2 = smooth(x, hik)
    m = min(len(a1), len(a2))
    y = (a1[:m] - a2[:m])
    y = np.pad(y, (0, n-m))[:n]
    y *= env(n, a, .05, 0, r, .3) * amp
    i = at(t0); mm = min(N-i, n)
    if mm > 0:
        mix[i:i+mm] += y[:mm]


def sweep(t0, dur, f0, f1, amp=0.16, a=.02, r=.3):
    n = int(dur*SR)
    t = np.arange(n)/SR
    f = f0*(f1/f0)**(t/max(t[-1], 1e-6))
    ph = 2*np.pi*np.cumsum(f)/SR
    y = (np.sin(ph) + 0.3*np.sin(2*ph)).astype(np.float32)
    y *= env(n, a, .1, 0, r, .5)*amp
    i = at(t0); m = min(N-i, n)
    if m > 0:
        mix[i:i+m] += y[:m]


# ---- room tone: a low breathing bed under everything -------------------
t = np.arange(N)/SR
bed = (0.020*np.sin(2*np.pi*55*t) * (0.6+0.4*np.sin(2*np.pi*0.07*t))
       + 0.012*np.sin(2*np.pi*82.5*t + 1.1))
air = rng.normal(0, 1, N).astype(np.float32)
k = 900
c = np.cumsum(np.insert(air, 0, 0)); air = (c[k:]-c[:-k])/k
air = np.pad(air, (0, N-len(air)))[:N]
mix += bed.astype(np.float32) + air*0.5

# ---- 1. sleep (0-4s): slow breath swells ------------------------------
for k_, t0 in enumerate((0.4, 2.2)):
    tone(110, t0, 1.8, amp=.055, partials=(1, 2), weights=(1, .2), a=.7, r=.9, sus=.8)

# ---- 2. notice (4-9s): the mote arrives, he wakes ---------------------
tone(1318.5, 4.5, 1.2, amp=.10, partials=(1, 2, 3), weights=(1, .3, .1), a=.005, r=.9, sus=.25)
tone(1975.5, 4.62, 1.0, amp=.055, a=.005, r=.8, sus=.2)
sweep(5.1, 0.5, 300, 900, amp=.05, a=.01, r=.35)      # the head snapping up
tone(659.3, 6.4, 1.6, amp=.06, a=.05, r=1.1, sus=.35)

# ---- 3. chase (9-14.5s): steps and two grabs --------------------------
for t0 in (9.3, 9.95, 10.7, 11.5, 12.4, 13.1):
    noise_hit(t0, .28, amp=.085, lo=.03, hi=.18, a=.002, r=.2)   # footfalls
sweep(10.6, .32, 800, 420, amp=.07, a=.004, r=.2)                # the miss
noise_hit(10.62, .18, amp=.07, lo=.10, hi=.55)
tone(880, 12.0, .5, amp=.05, a=.004, r=.4, sus=.2)
sweep(13.55, .30, 500, 1400, amp=.09, a=.004, r=.2)              # closing in

# ---- 4. ignite (14.5-19s): the catch --------------------------------
noise_hit(15.05, .5, amp=.13, lo=.05, hi=.6, a=.001, r=.45)
for f, a_ in ((523.3, .16), (784.0, .11), (1046.5, .085), (1568.0, .05)):
    tone(f, 15.05, 3.4, amp=a_, partials=(1, 2, 4), weights=(1, .28, .08),
         a=.004, r=2.6, sus=.30)
sweep(14.85, .25, 180, 520, amp=.09, a=.01, r=.15)               # the intake
tone(261.6, 15.1, 2.4, amp=.09, partials=(1, 2), weights=(1, .3), a=.01, r=2.0, sus=.4)

# ---- 5. bloom (19-25.5s): the idea multiplies ------------------------
ARP = [523.3, 659.3, 784.0, 987.8, 1174.7, 1396.9, 1568.0]
for i, f in enumerate(ARP):
    tone(f, 19.3 + i*0.34, 2.6, amp=.075 - i*0.004,
         partials=(1, 2, 3), weights=(1, .22, .07), a=.01, r=2.2, sus=.22)
for i, f in enumerate((392.0, 523.3, 659.3)):
    tone(f, 20.0 + i*0.9, 4.0, amp=.055, a=.6, r=2.6, sus=.5)
tone(1046.5, 23.4, 2.0, amp=.05, a=.02, r=1.7, sus=.2)

# ---- 6. offer (25.5-30s): settles, warm and open --------------------
for f, a_ in ((349.2, .105), (440.0, .085), (523.3, .075), (659.3, .05)):
    tone(f, 25.6, 4.2, amp=a_, partials=(1, 2, 3), weights=(1, .25, .08),
         a=.35, r=3.2, sus=.45)
tone(880.0, 27.4, 2.4, amp=.045, a=.05, r=2.1, sus=.25)

# ---- one convolution tail so it sits in a room ----------------------
ir_n = int(SR*1.5)
ir = rng.normal(0, 1, ir_n).astype(np.float32) * np.exp(-np.linspace(0, 7, ir_n))
ir[0] = 1.0
ir /= np.abs(ir).sum()
# FFT convolution - a direct convolve of 30s against a 1.5s tail is O(n*m)
L = 1
while L < N + ir_n:
    L <<= 1
wet = np.fft.irfft(np.fft.rfft(mix, L) * np.fft.rfft(ir, L))[:N].astype(np.float32)
out = mix*0.76 + wet*0.62

# gentle limiter
peak = np.max(np.abs(out))
out = out/peak*0.82 if peak > 0 else out
out = np.tanh(out*1.25)*0.86
fade = int(SR*0.35)
out[:fade] *= np.linspace(0, 1, fade)
out[-fade:] *= np.linspace(1, 0, fade)

dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "out", "renders", "story_score.wav")
os.makedirs(os.path.dirname(dst), exist_ok=True)
st = np.stack([out, np.roll(out, 240)*0.94 + out*0.06], axis=1)   # slight width
st = np.clip(st, -1, 1)
with wave.open(dst, 'w') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st*32767).astype('<i2').tobytes())
print("wrote", dst, "%.1fs" % DUR)
