Takeout
=======
An issue with any complex system/library is that as more features are added, it steepens the learning curve for new users.  The cost of understanding the relevant parts of the system and installing it can become prohibitive.  Moreover, while web applications are a plausible way to bridge language/platform gaps (e.g., perform complex server side processing instead of custom android/iphone implementations) it is an advantage to have the ability to run a system on a variety of platforms.  This was considered during Picarus's development and we decided to write all of the execution-time algorithms (e.g., classifier prediction) in C/C++ so that the models (e.g., classifiers, search indexes, features) used by the system would be as cross-platform as possible.  The reason for specifiying execution-time algorithms is that they are often simple (e.g., for linear classifiers it is a dot product) compared to the training portion (e.g., numerical optimization).  What that means is that the training phase may be tied into the server or depend on Python, but post-training, everything is done in pure C/C++ with BLAS.

To simplify installation of just the execution-time algorithms, they are in the Picarus Takeout repo.  All modules in Picarus can be exported using the Takeout link in the web app and then executed on a system with Picarus Takeout installed.  The goal is to make this library have as few required dependencies as possible (e.g., use ifdef's to ignore modules that need dependencies we don't have); however, this is an ongoing process and the most significant dependency is on OpenCV, primarily for IO, color conversion, and resizing which could be replicated in the takeout tree without depending on the entire library.

https://github.com/bwhite/picarus_takeout


Linux (ubuntu)
---------------
- Build OpenCV (latest version) from source
- Get msgpack (apt-get install libmsgpack-dev)
- Get blas (apt-get install libatlas3gf-base)
- Get fftw3 (apt-get install libfftw3-dev)
- Get cmake (apt-get install cmake)
- cmake picarus_takeout
- make

Windows
--------
Below is a guide to installing Picarus Takeout on Windows.

CMake
+++++
http://www.cmake.org/cmake/resources/software.html

Visual Studio
++++++++++++++
Visual Studio (tested on C++ 2010 Express).
https://www.microsoft.com/visualstudio/eng/downloads

OpenCV
++++++
MAKE SURE TO USE RELEASE MODE IN VISUAL STUDIO! OpenCV won't work without it.
http://sourceforge.net/projects/opencvlibrary/files/opencv-win/
http://docs.opencv.org/doc/tutorials/introduction/windows_install/windows_install.html#windowssetpathandenviromentvariable

PThreads
++++++++
ftp://sourceware.org/pub/pthreads-win32/prebuilt-dll-2-9-1-release

Msgpack
+++++++
http://www.7-zip.org/ (for opening up the .tar.gz)
http://sourceforge.net/projects/msgpack/files/msgpack/cpp/

Convert the project, build it.

A few problems need to be fixed
https://github.com/qehgt/myrpc/issues/3

*  Move type.hpp from include\msgpack\type into include\msgpack
*  Replace this file https://raw.github.com/msgpack/msgpack-c/master/sysdep.h

FFTW
++++

http://www.fftw.org/install/windows.html
http://www.fftw.org/fftw-3.3.3.tar.gz


Include/Library Paths
++++++++++++++++++++++
An example of all of the paths, libraries, and command line arguments can be found here https://gist.github.com/bwhite/5493885

Building
+++++++++
* Use cmake to create a directory (e.g., /build) by pointed its source input at the inner picarus_takeout folder (has the CMakeLists.txt file) and clicking "generate".
* Go into build, open picarus.vcxproj (note, this example is for the picarus project, but the same applies to any other projects generated by cmake)
* Change to release mode.  In the solution explorer, right click on picarus, go to properties.
* In Configuration Properties/C++/General/Additional Include Directories add all of the include dirs. (see gist above for example of all these paths)
* For opencv make sure to include every single directory in modules/*/include (lots of copy and pasting)
* Under linker/general, add the library paths under "Additional Library Directories".
* Close that window, right click on picarus, go to build.
* You will need a 1.) a picarus model (if you need one ask me) and an input is an image
* Copy the model and input image into the /build/Release directory.
* Either 1.) copy all the dll's into the /build/Release directory or 2.) make sure windows knows where to find them.
* Go into the /build/Release directory in a terminal, and type  "picarus <model> <input> <output>"
* Model is the picarus model, input is an image, and output is where to store the output file
* If everything worked, you'll have a new output file at the path you specified, it is in msgpack format.
