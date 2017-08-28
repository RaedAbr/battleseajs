all: description.pdf mostlyclean

description.pdf: description.tex
	pdflatex description.tex

mostlyclean:
	rm -rf *.log *.aux *.out

clean:
	rm -rf *.pdf *.log *.aux *.out

rebuild: clean all
