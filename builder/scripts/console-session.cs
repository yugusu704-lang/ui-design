using System;
using System.Threading;
using System.Runtime.InteropServices;

namespace Atelier
{
    public sealed class ConsoleSession : IDisposable
    {
        private delegate bool Handler(int controlType);

        private readonly AutoResetEvent closeRequested = new AutoResetEvent(false);
        private readonly Handler handler;
        private bool registered;

        [DllImport("Kernel32.dll", SetLastError = true)]
        private static extern bool SetConsoleCtrlHandler(Handler handler, bool add);

        public ConsoleSession()
        {
            handler = HandleControlEvent;
            registered = SetConsoleCtrlHandler(handler, true);
            if (!registered)
                throw new InvalidOperationException("Could not register the console close handler (Win32 " + Marshal.GetLastWin32Error() + ").");
        }

        private bool HandleControlEvent(int controlType)
        {
            // Ctrl+C, Ctrl+Break, the window close button, logoff, and shutdown.
            if (controlType != 0 && controlType != 1 && controlType != 2 && controlType != 5 && controlType != 6)
                return false;

            closeRequested.Set();
            return true;
        }

        public void WaitForClose()
        {
            closeRequested.WaitOne();
        }

        public void Dispose()
        {
            if (registered)
            {
                SetConsoleCtrlHandler(handler, false);
                registered = false;
            }
            closeRequested.Dispose();
        }
    }
}
