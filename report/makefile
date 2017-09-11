all: report.pdf mostlyclean

report.pdf: report.tex
	pdflatex report.tex

mostlyclean:
	rm -rf *.log *.aux *.out

clean:
	rm -rf *.pdf *.log *.aux *.out

rebuild: clean all
